How to use scrapper!
===================
 - Download and install nodejs from the following url. https://nodejs.org/en/download/
 - Open Command Prompt(cmd) and go to the project folder.
 - In the project root directory, please run following command.
```
npm install
npm start
```
 - Now open http://localhost:3000 on the web browser.
 - There are 4 fields available on the page.
 - 1: Catalog name, 2: Catalog base url, 3: Start page no, 4: End page no
 - You can scrape catalog from tmall.com by pressing start.

How to get URL
======================
1. Use google translate to get search keyword in Chinese.
2. Goto tmall.com, enter the above translated keyword and select the best suggested keyword from the dropdown.
3. Browse the items
4. If the result is correct, proceed to step 5, if not, go to step 2 and choose another keyword from the dropdown.
5. Copy the url and replace the page no `s=1` with `s={{#PAGE}}`.
```
https://list.tmall.com/search_product.htm?spm=a220m.1000858.0.0.d811797k7Xo1C&cat=50025135&s={{#PAGE}}&q=%B3%A4%D0%E4%C1%AC%D2%C2%C8%B9&sort=s&style=g&from=.list.pc_1_searchbutton&type=pc#J_Filter
```
6. Use the url in the node app to scrap
