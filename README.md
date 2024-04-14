# Registrirani avtomobili v Sloveniji 🚗

## Opis

To je spletna aplikacija za analiziranje in izvažanje podatkov o vseh registriranih avtomobilih in njihovi zgodovini.

Povezava: https://vozila-slo-app.netlify.app/

![Screenshot](screenshot.png)

V primeru, da aplikacijo uporabljaš prvič, moraš najprej prenesti vse podatke. To narediš s klikom na gumb "Prenesi celotno bazo". V mojem primeru prenos traja ~1min. Baza se shrani v brskalnik, tako, da jo ob naslednji uporabi ni potrebno ponovno prenašati (če želiš bazo zbrisati glej spodaj \*). Baza se prenese iz [tukaj](https://www.dropbox.com/scl/fo/op2kgmsnzzjyjcwwaqxwt/h?rlkey=9z463algspgjlu3va1fkw1fir&dl=0). Celotna skripta, ki je bila uporabljena za pripravo podatkov je dostopna v mapi [data_prep_notebooks](data_prep_notebooks/). Trenutno sta v bazi samo kategoriji M1 in M1G (to so osebni avtomobili) od leta 2016 do 2022. Podatki za celotno leto 2023 še niso objavljeni.

Če je bil avtomobil v evidenci registriranih vozil v vseh letih od 2016 do 2022, bo v bazi zabeležen 7x, za vsako leto enkrat. Leto zapisa je ponazorjeno s stolpcem "leto_zapisa".

Za poizvedovanje po bazi se uporablja SQL. Primer je prikazan spodaj.

Prvotni vir podatkov je spletna stran [OPSI](https://podatki.gov.si/)

## Primeri SQL poizvedb

Ime tabele, po kateri lahko delamo poizvedbe je `data.parquet`. Tabela vsebuje očiščene podatke o registriranih vozilih od leta 2016 dalje. Kot je že zgoraj napisano je pomembno, da vemo, da je vsak avto v tabeli lahko zabeležen večkrat.

Poglejmo si kar na primeru. Če poženem poizvedbo;

```sql
SELECT * FROM 'data.parqeut'
WHERE vin='xxxxxxxxxxxxxxxxx'
```

dobim rezultat:
| vin | ... | leto_zapisa |
|----------------------------|-----------|-------------|
| xxxxxxxxxxxxxxxxx | ... | 2016 |
| xxxxxxxxxxxxxxxxx | ... | 2017 |
| xxxxxxxxxxxxxxxxx | ... | 2018 |
| xxxxxxxxxxxxxxxxx | ... | 2019 |

To pomeni, da je bil avto z vin (xxxxxxxxxxxxxxxxx) registriran v letih 2016, 2017, 2018 in 2019. To je pomembno zato, ker v primeru, da želimo narediti določeno statistiko npr. za leto 2019, moram k naši poizvedbi vedno dodati:

```sql
WHERE leto_zapisa = 2019 --oz. katero drugo leto, ki nas zanima
```

Recimo, da me zanima število električnih Volkswagnov v zadnjem letu _(trenutno je to 2022, ker podatki za 2023 še niso na voljo)_.
Če poženem poizvedbo;

```sql
-- Ta poizvdeva NI OK
SELECT * FROM 'data.parquet'
WHERE gorivo = 'ni goriva' AND znamka = 'volkswagen';
```

ne bom dobil pravilnega odgovora, kajti v tej poizvedbi, se lahko isti avto pojavi večkrat, zaradi zgoraj omenjenega dejstva.

---

1. Spodaj pa je pravilna poizvedba, če želimo izpisati vse električne Volkswagne v letu 2022:

```sql
SELECT * FROM 'data.parquet'
WHERE leto_zapisa = 2022 AND gorivo = 'ni goriva' AND znamka = 'volkswagen';
```

- Če bi pa želel enako statistiko za leto 2019:

```sql
SELECT * FROM 'data.parquet'
WHERE leto_zapisa = 2019 AND gorivo = 'ni goriva' AND znamka = 'volkswagen';
```

---

2. Ta poizvedba pa izpiše število e-golfov v posameznih letih

```sql
SELECT leto_zapisa, COUNT(*) AS stevilo FROM 'data.parquet'
WHERE model_simple = 'e-golf'
GROUP BY leto_zapisa
ORDER BY leto_zapisa DESC;
```

---

3. Kako filtrirati po datumu?

```sql
-- filtriraj po letu
-- ta izpiše prvih 5 avtomobilov iz leta 2022, ki so imeli prvo registracijo leta 2010
SELECT * FROM 'data.parquet'
WHERE EXTRACT(YEAR FROM prva_registracija) = 2010 AND leto_zapisa = 2022
LIMIT 5;

-- filtriraj po mesecu
-- ta izpiše prvih 5 avtomobilov iz leta 2022, ki so imeli prvo registracijo meseca oktobra
SELECT * FROM 'data.parquet'
WHERE EXTRACT(MONTH FROM prva_registracija) = 10 AND leto_zapisa = 2022
LIMIT 5;
```

## Zakaj?

Več o tem, zakaj sem tole naredil, sem napisal [tukaj](https://medium.com/@marcel.lah/podatki-o-registriranih-vozilih-v-sloveniji-b8651bcf7f19).

#### \* Kako zbrisati podatke iz brskalnika?

[Na kratko je napisano tukaj](https://www.howtogeek.com/664912/how-to-clear-storage-and-site-data-for-a-single-site-on-google-chrome/)
