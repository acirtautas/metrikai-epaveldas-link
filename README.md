# metrikai.lt + epaveldas.lt link Tampermonkey userscript

Fixes broken links to epaveldas.lt on metrikai.lt and automatically navigates to the correct page in the epaveldas.lt document viewer.

## Key Features
- **Link fixing:** Detects outdated `vbspi/biRecord.do` and `recordImageSmall` links on metrikai.lt and replaces them with working `epaveldas.lt/preview` links.
- **Page navigation:** Appends the original page number to the new link, so the correct document page opens automatically.
- **Auto page input:** On epaveldas.lt, reads the page number from the URL and enters it into the viewer's page input, jumping straight to the right folio.
- **Visual indicator:** The old broken link is struck through, and a green 🔗 link is inserted next to it for easy access.
- **Supports both archive types:** Handles links referencing both `LVIA` and `ARCH` document collections.

## Installation
1. **Install Tampermonkey:** Ensure you have the [Tampermonkey](https://www.tampermonkey.net/) extension installed in your browser.
2. **Install/Update Script:**
    - Click the provided link to install or update the script directly: [Install/Update metrikai-epaveldas-link.user.js](https://raw.githubusercontent.com/acirtautas/metrikai-epaveldas-link/main/metrikai-epaveldas-link.user.js).
    - Alternatively, download and copy [`metrikai-epaveldas-link.user.js`](https://github.com/acirtautas/metrikai-epaveldas-link/blob/main/metrikai-epaveldas-link.user.js) from this repository and manually add it to your Tampermonkey extension.
3. **Refresh a metrikai.lt page:** Broken epaveldas.lt links will now have a green 🔗 working link inserted next to them.

## Usage
- Browse metrikai.lt as usual — fixed links appear automatically next to any broken ones.
- Click the green 🔗 link to open the document on epaveldas.lt.
- The viewer will automatically navigate to the correct page.

Good luck with your genealogy research!