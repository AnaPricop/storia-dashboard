import requests
from bs4 import BeautifulSoup
import csv
from datetime import datetime, timedelta
import os
from azure.storage.blob import BlobServiceClient
import re
import time

def converteste_data_relativa(text_data):
    if not text_data:
        return None

    today = datetime.now()
    text_data = text_data.lower()

    if 'astăzi' in text_data:
        return today.date()
    if 'ieri' in text_data:
        return (today - timedelta(days=1)).date()

    match = re.search(r'acum (\d+) zile', text_data)
    if match:
        zile = int(match.group(1))
        return (today - timedelta(days=zile)).date()

    return None

if __name__ == "__main__":

    AZURE_CONNECTION_STRING = "LIPESTE_CONNECTION_STRING_UL_TĂU_AICI"

    NUMAR_PAGINI_DE_EXTRAS = 50
    BASE_URL = "https://www.storia.ro/ro/rezultate/vanzare/apartament/bucuresti"
    HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    }

    anunturi_istorice = []
    print(f"Încep extragerea istorică pentru {NUMAR_PAGINI_DE_EXTRAS} pagini...")

    for pagina_curenta in range(1, NUMAR_PAGINI_DE_EXTRAS + 1):
        url_complet = f"{BASE_URL}?page={pagina_curenta}"
        print(f"\n--- Procesez pagina {pagina_curenta}: {url_complet} ---")

        try:
            response = requests.get(url_complet, headers=HEADERS)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'lxml')
            lista_anunturi_html = soup.find_all('article', class_='css-xv0nyo')

            if not lista_anunturi_html:
                print(f"AVERTISMENT: Nu am găsit anunțuri pe pagina {pagina_curenta}. Oprire.")
                break

            print(f"Am găsit {len(lista_anunturi_html)} anunțuri.")

            for anunt_html in lista_anunturi_html:
                tag_data_container = anunt_html.find('div', class_='css-1cn5uqr')
                data_relativa = tag_data_container.get_text(strip=True) if tag_data_container else None

                data_calculata = converteste_data_relativa(data_relativa)


                if data_calculata:
                    pret_container = anunt_html.find('span', class_='css-1grq1gi')
                    pret_m2_container = anunt_html.find('span', class_='css-13du2ho')
                    specificatii = anunt_html.find_all('dd', class_='css-17je0kd')

                    anunturi_istorice.append({
                        'data_postare': data_calculata.strftime('%Y-%m-%d'),
                        'titlu': anunt_html.find('p', attrs={'data-cy': 'listing-item-title'}).get_text(strip=True) if anunt_html.find('p', attrs={'data-cy': 'listing-item-title'}) else '',
                        'locatie': anunt_html.find('p', class_='css-42r2ms').get_text(strip=True) if anunt_html.find('p', class_='css-42r2ms') else '',
                        'pret_brut': pret_container.get_text(strip=True) if pret_container else '',
                        'pret_m2_brut': pret_m2_container.get_text(strip=True) if pret_m2_container else '',
                        'camere_brut': specificatii[0].get_text(strip=True) if len(specificatii) > 0 else '',
                        'suprafata_brut': specificatii[1].get_text(strip=True) if len(specificatii) > 1 else '',
                        'etaj_brut': specificatii[2].get_text(strip=True) if len(specificatii) > 2 else '',
                        'link': "https://www.storia.ro" + anunt_html.find('a', attrs={'data-cy': 'listing-item-link'})['href'] if anunt_html.find('a', attrs={'data-cy': 'listing-item-link'}) else ''
                    })

        except requests.RequestException as e:
            print(f"Eroare la accesarea paginii {pagina_curenta}: {e}")
            continue

        print(f"Aștept 3 secunde...")
        time.sleep(3)

    if not anunturi_istorice:
        print("\nExtragere finalizată, dar nu s-a găsit niciun anunț cu o dată recunoscută.")
    else:

        nume_fisier = 'anunturi_istoric_initial.csv'
        chei = anunturi_istorice[0].keys()

        with open(nume_fisier, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=chei)
            writer.writeheader()
            writer.writerows(anunturi_istorice)


        try:
            blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
            blob_client = blob_service_client.get_blob_client(container="date-brute-imobiliare", blob=nume_fisier)

            with open(nume_fisier, "rb") as data:
                blob_client.upload_blob(data, overwrite=True)
            print("Încarcare în Azure finalizata cu succes!")
        except Exception as ex:
            print(f"EROARE la încarcarea în Azure: {ex}")