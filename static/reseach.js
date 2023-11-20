let baseUrl = window.location.href
if (baseUrl.slice(-1) !== "/"){ baseUrl += "/"}
baseUrl = baseUrl.replace("reseach/", "")

/**
 * Ресайз просмотрощика под окно
 */
function resize(){
    let width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
        height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
        reseachViewer = document.getElementById("reseachViewer"),
        navBarMain = document.getElementById("navBarMain");
    
    height -= navBarMain.offsetHeight + 10;
    reseachViewer.setAttribute("height", height);
    reseachViewer.setAttribute("width", width);
}

window.addEventListener('resize', (e) => {resize();})

window.addEventListener('load', (e) => {
    resize();
    document.getElementById("navBasicLink").setAttribute("href", `${baseUrl}`);
    document.getElementById("navReseachLink").setAttribute("href", `${baseUrl}reseach`);
})