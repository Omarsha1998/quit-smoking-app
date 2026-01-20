import localforage from "localforage";

localforage.config({
  name: "quitSmokingApp",
  storeName: "quit_data",
});

export default ({ app }) => {
  app.config.globalProperties.$storage = localforage;
};
