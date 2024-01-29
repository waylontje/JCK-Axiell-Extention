import { ini } from "/ini.js";

setTimeout(async () => {
  chrome.storage.local.get(["startValue"]).then((result) => {
    if (!result.startValue) {
      // If "startValue" is not stored, set it to the default object ini
      chrome.storage.local.set({ startValue: ini }, function () {
        console.log("Data saved:", ini);
      });
    } else {
      // If "startValue" is already stored, display the existing value
      console.log("Existing value:", result.startValue);
      Object.assign(ini, result.startValue);
    }
  });

  const items = Object.keys(ini);
  items.forEach((item) => {
    let elem = document.getElementById(item);
    if (elem) {
      //Input all fields from ini file
      elem.addEventListener("change", () => {
        //adjust ini with new value
        ini[item] = elem.value.split(",");
        console.log(ini);

        //save ini to sesison storage
        chrome.storage.local.set({ startValue: ini }).then(() => {
          console.log("Value was set");
          chrome.storage.local.get(["startValue"]).then((result) => {
            console.log("to this", result.startValue);
          });
        });
      });
    }
  });

  const storageCache = { count: 0 };
  // Asynchronously retrieve data from storage.session, then cache it.
  const inis = await chrome.storage.local.get(["startValue"]);
  // Copy the data retrieved from storage into storageCache.

  Object.assign(storageCache, inis.startValue);
  console.log(storageCache);
  const itemss = Object.keys(storageCache);
  itemss.forEach((item) => {
    let elem = document.getElementById(item);
    if (elem) {
      //Input all fields from ini file
      elem.value = storageCache[item];
    }
  });
}, 200);
