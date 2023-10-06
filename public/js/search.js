(function (window, document) {
    "use strict";

    const resultsElement = document.getElementById("searchResults");
    const noResultsElement = document.getElementById("noResultsFound");
  
    const search = (e) => {
      const results = window.searchIndex.search(e.target.value, {
        bool: "OR",
        expand: true,
      });

      debounce(() => logAnalytics({'count': results.length, 'searchTerm': e.target.value}), 750);
    // debounce(logAnalytics);
  
      resultsElement.innerHTML = "";
      results.splice(50);
      if (results === undefined || results.length > 0 || e.target.value.length < 2) {
        noResultsElement.style.display = "none";
        results.map((r) => {
          const { id, title, description } = r.doc;
          const el = document.createElement("li");
          el.setAttribute("class", "search-result-item")
          resultsElement.appendChild(el);
  
          const header = document.createElement("div");
          header.setAttribute("class", "search-result-header");
          el.appendChild(header);
  
          const a = document.createElement("a");
          a.setAttribute("href", id);
          a.textContent = title;
          header.appendChild(a);
  
          const p = document.createElement("div");
          p.textContent = description;
          el.appendChild(p);
        });
      } else {
        noResultsElement.style.display = "block";
      }
    };
  
    fetch("/search-index.json").then((response) =>
      response.json().then((rawIndex) => {
        window.searchIndex = elasticlunr.Index.load(rawIndex);
        document.getElementById("searchField").addEventListener("input", search);
      })
    );

    const logAnalytics = (data) => {
        console.log("Log analytics");
        console.log(data);

        try {
            if (typeof umami != 'undefined') {
                umami.track('search', data)
            } else {
                console.log('Tracking is not enabled')
            }
        } catch (e) {
            console.error(e);
        }
    }

    let timer;

    const debounce = (func, timeout = 3000) => {
        clearTimeout(timer);
        (function() {
            timer = setTimeout(() => { func() }, timeout);
        })()
      }
  })(window, document);