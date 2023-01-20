const url = "../docs/I-Am-Watching-You.pdf";

let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageIsPending = null;

const scale = 1.2,
  canvas = document.querySelector("#render"),
  ctx = canvas.getContext("2d");

// render the page
const renderPage = (num) => {
  pageIsRendering = true;

  // getting page
  pdfDoc.getPage(num).then((page) => {
    // setting scale
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport,
    };

    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageIsPending !== null) {
        renderPage(pageIsPending);
        pageIsPending = null;
      }
    });

    document.getElementById("page-num").textContent = num;
  });
};

const queueRenderPage = (num) => {
  if (pageIsRendering) {
    pageIsPending = true;
  } else {
    renderPage(num);
  }
};

const showPreviousPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};

const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};

//  get document
pdfjsLib
  .getDocument(url)
  .promise.then((pdfDoc_) => {
    pdfDoc = pdfDoc_;
    //   console.log(pdfDoc_);
    document.getElementById("page-count").textContent = pdfDoc.numPages;

    renderPage(pageNum);
  })
  .catch((err) => {
    const div = document.createElement("div");
    div.className = "error";
    div.appendChild(document.createTextNode(err.message));
    document
      .querySelector("body")
      .insertBefore(div, document.querySelector(".container"));
    document.querySelector(".top-bar").style.display = "none";
  });

// button events
document.getElementById("prev").addEventListener("click", showPreviousPage);
document.getElementById("next").addEventListener("click", showNextPage);

document.addEventListener("keydown", function (e) {
  if (e.keyCode == 37) {
    showPreviousPage();
  } else if (e.keyCode == 39) {
    showNextPage();
  }
});
