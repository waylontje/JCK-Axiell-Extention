console.log("gelukt!");

let active = true;
let contentGrabbed = false;
let content;
const storageCache = {};
// Asynchronously retrieve data from storage.session, then cache it.
chrome.storage.local.get(["startValue"]).then((ini) => {
  // Copy the data retrieved from storage into storageCache.
  Object.assign(storageCache, ini.startValue);
  console.log(storageCache);

  // Create a MutationObserver instance and a callback function
  const observer = new MutationObserver((mutationsList, observer) => {
    // Handle each mutations seperately here
    mutationsList.forEach((mutation) => {
      //if it includes a specific word (preferably put this in ini later)
      if (mutation.target.outerHTML.includes("Digitaal")) {
        storageCache.QueryText.forEach((qtext) => {
          let contenttemp = document.querySelectorAll(qtext);

          if ((contenttemp.length > 0) & !contentGrabbed) {
            content = getContentOnce(content, qtext);
            console.log(mutation);
          }
        });
      }
    });

    contentGrabbed = false;
  });

  // Configuration of the observer:
  const config = { attributes: true, childList: true, subtree: true };

  // Start observing the target node for configured mutations

  const targetNode = getTargetNodeWithRetry();
  tryObserveWithDelay(targetNode, config);

  //if source links exist achange link into playable vid

  //if link is clicked open source in browser

  function rebuildLink(originalURL) {
    const modifiedURL = originalURL.replace(/\\/g, "/");

    // Replace the server and port
    const newURL = modifiedURL.replace(
      "//st-arsenaal/",
      "https://@st-arsenaal.jhm.nl:5006/"
    );

    return newURL;
  }

  function tryObserveWithDelay(targetNode, config) {
    try {
      // Attempt to observe

      console.log(targetNode);
      observer?.observe(targetNode, config);
      console.log("Observing started successfully");
    } catch (error) {
      console.log("Error starting observation (retrying in 3 seconds):", error);

      // Retry after a delay (e.g., 3 seconds)

      setTimeout(() => {
        tryObserveWithDelay(targetNode, config);
      }, 10000);
    }
  }

  function getTargetNodeWithRetry() {
    // Try to get the targetNode
    let targetNode = document.getElementById("workspace_ResultCursorWidget_ResultCursorView_RecordEditorWidget");

    // If it's empty, try the alternative ID
    if (!(targetNode instanceof Node)) {
      targetNode = document.getElementById(
        "ResultCursorWidget_ResultCursorView_RecordEditorWidget"
      );
    }

    // If both are empty, retry after a delay (e.g., 3 seconds)
    if (!(targetNode instanceof Node)) {
      console.log("Both IDs are empty. Retrying in 3 seconds...", targetNode);

      setTimeout(() => {
        targetNode = getTargetNodeWithRetry();
      }, 3000);
    }

    return targetNode;
  }

  function getContentOnce(content, qtext) {
    let contents = document.querySelectorAll(qtext);
    if (contentGrabbed) {
      return;
    } else if (content != contents) {
      console.log("Nieuwe content gevonden");
      changeLink(contents);
      contentGrabbed = true;
      return contents;
    } else {
      return;
    }
  }

  function changeLink(content) {
    console.log(content);
    if ((content != undefined) & !contentGrabbed) {
      content.forEach((link) => {
        console.log(`link gotten once ${link.value}`);

        let eigenLink = rebuildLink(link.value);
        console.log(eigenLink);
        if (eigenLink) {
          const isAudio = ["wav"];
          let element;
          if (isAudio.some((v) => eigenLink.includes(v))) {
            element = createElement(eigenLink, "wav");
          } else {
            element = createElement(eigenLink, "mov");
          }
          replaceElement(element, link);
        }
      });
    }
  }

  function replaceElement(elem, link) {
    let parent = link.parentElement;
    parent.replaceChild(elem, link);
    //element stoppen
    elem.pause();
    return;
  }

  function addAttributes(elem, a) {
    Object.keys(elem).forEach((att) => {
      let x = document.createAttribute(att);
      x.value = elem[att];
      a.setAttributeNode(x);
    });
    return a;
  }

  function createElement(eigenLink, sort) {
    const vidAttributes = {
      autoplay: false,
      controls: "",
      name: "media",
    };
    let a;
    let srcAttributes = {
      src: "",
      type: "",
    };

    if (sort == "wav") {
      a = document.createElement("audio");
      srcAttributes.type = "audio/x-wav"
    } else {
      a = document.createElement("video");
      srcAttributes.type = "video/mp4"
      vidAttributes.height = "300px"
    }
    a = addAttributes(vidAttributes, a);
    console.log(a);
    
    srcAttributes.src = eigenLink;

    let b = document.createElement("source");
    b = addAttributes(srcAttributes, b);

    a.appendChild(b);

    console.log(a);

    return a;
  }
});
