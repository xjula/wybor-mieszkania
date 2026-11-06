# Wybór mieszkania — projekt do VS Code

Jednoużytkownikowa aplikacja lokalna. Przeglądarka wysyła zapytania do API Node.js; tylko serwer łączy się z PostgreSQL. Oferty i preferencje pozostają w bazie po ponownym uruchomieniu. Ranking SAW jest obliczany z aktualnych danych. Aplikacja nie importuje danych z poprzedniej wersji localStorage.

## Najprościej: Docker Compose
1. Zainstaluj i uruchom Docker z obsługą Compose (np. Docker Desktop).
2. Rozpakuj archiwum. W VS Code wybierz Plik → Otwórz folder i wskaż katalog zawierający compose.yaml.
3. W terminalu VS Code uruchom:
   
       docker compose up --build

4. Otwórz http://localhost:3000. Nie otwieraj index.html bezpośrednio i nie używaj Live Server: interfejs potrzebuje API.
5. Zakończ przez Ctrl+C, a potem docker compose down. Dane zostają w nazwanym woluminie; opcja -v usuwa dane. Po edycji kodu użyj ponownie docker compose up --build.

## Wygodna praca nad kodem: baza w Dockerze, Node na komputerze
Wymagania: Node.js 22.9 lub nowszy i Docker Compose. Jeśli cały zestaw kontenerów już działa, najpierw wykonaj docker compose stop app, aby zwolnić port 3000.
1. Uruchom tylko bazę: docker compose up -d db.
2. Skopiuj .env.example do .env w tym samym katalogu. PowerShell: Copy-Item .env.example .env. Linux/macOS: cp .env.example .env.
3. Uruchom npm install i następnie npm run dev. Serwer automatycznie przeładuje się po zmianach w kodzie serwera; interfejs odśwież w przeglądarce.
4. Otwórz http://localhost:3000. Do debugowania zakończ npm run dev i naciśnij F5 w VS Code.
5. Jeśli masz już PostgreSQL, Docker nie jest konieczny: utwórz bazę mieszkania, nadaj użytkownikowi prawa do tworzenia tabel i wpisz jego adres połączenia w .env (lokalny PostgreSQL zwykle używa portu 5432). Serwer utworzy tabele podczas startu.

## Sprawdzenie bazy
W konfiguracji Compose baza z komputera jest dostępna pod 127.0.0.1:5433, baza i użytkownik: mieszkania, hasło deweloperskie: mieszkania_dev. Możesz połączyć się w pgAdmin lub wykonać:
   
    docker compose exec db psql -U mieszkania -d mieszkania -c "SELECT * FROM offers ORDER BY id;"

## Co edytować?
- db/001_schema.sql — tabele offers i preferences oraz trzy oferty startowe. Dane przykładowe nie wracają po usunięciu.
- server/index.js — start aplikacji, walidacja i parametryzowane zapytania SQL. API: GET /api/state, POST /api/offers, PUT i DELETE /api/offers/:id, PUT /api/preferences.
- server/ranking.js — SAW: odrzuca mieszkania ponad budżet, normalizuje cenę i dojazd metodą min–max, mnoży przez wagi i sumuje. Gdy wartości kryterium są identyczne, wszystkie oferty otrzymują 1 dla tego kryterium.
- public/ — HTML, CSS i obsługa formularzy. Suwak prezentuje nowe wagi; „Zastosuj preferencje” zapisuje je i aktualizuje ranking.
- tests/ — npm test sprawdza obliczenia bez bazy. npm run test:db sprawdza API z prawdziwą bazą z .env; konto musi móc tworzyć schematy. Test tworzy i usuwa osobny schemat, nie modyfikuje ofert aplikacji.

## Pierwszy scenariusz
Przy budżecie 500 000 zł i wadze ceny 70% wygrywa A. Po zmianie na 30% i zapisaniu preferencji wygrywa B. C w obu przypadkach przekracza budżet o 20 000 zł. Edytuj ofertę i odśwież stronę, aby sprawdzić trwałość zapisu.

TOPSIS i rozmyte modelowanie preferencji są kolejnymi etapami, a nie funkcjami tej wersji.
