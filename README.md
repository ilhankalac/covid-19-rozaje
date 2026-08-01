# Covid-19 statistics for Rožaje

Daily COVID-19 statistics for the municipality of Rožaje, Montenegro — summary
cards, charts and a filterable table over official data from the Institute of
Public Health of Montenegro.

**Live: [covid-19-rozaje.web.app](https://covid-19-rozaje.web.app)**

> **Archived.** The app tracked data from 18 June 2020 to 8 September 2021
> (404 published snapshots). Collection has stopped, so no new numbers are
> added — the site stays online as an archive of that period.

Non-profit project developed in my free time.

## How it works

An Angular SPA reads from Firebase Realtime Database and renders it. The
database is publicly readable only under `dailyStatistics`; writes are closed
to everyone (see `database.rules.json`).

Data was collected by a separate scraper service pulling from ijzcg.me:
[github.com/ilhankalac/scraper-covid-19-rozaje](https://github.com/ilhankalac/scraper-covid-19-rozaje)

Built with Angular 10, Angular Material, Chart.js, Firebase (Realtime Database
+ Hosting) and GitHub Actions.

## Running locally

Requires Node 18 or newer.

```bash
npm install
npm start          # dev server on http://localhost:4200/
npm run build:prod
```

The project is on Angular 10, whose webpack uses a hash that newer OpenSSL no
longer provides, so the npm scripts set `NODE_OPTIONS=--openssl-legacy-provider`.
Run builds through them rather than calling `ng` directly. On Windows, use Git
Bash or WSL.

The Firebase config in `src/environments/` is committed on purpose — it is a
public project identifier rather than a secret, and it ends up in `main.js`
regardless. Access is controlled by the database rules.

## Deployment

Every push to `master` triggers the GitHub Actions workflow
(`.github/workflows/master.yml`), which builds the app and deploys it to
Firebase Hosting.

## Screenshots

<img src="/screenshots/header.JPG">
<b>Header</b>
<img src="/screenshots/chart.JPG">
<b>Chart</b>
<img src="/screenshots/table.JPG">
<b>Table</b>
