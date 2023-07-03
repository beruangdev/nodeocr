function welcomePage() {
  return {
    showModal: false,
    selectedImage: {
      id: 0,
      filename: "",
      metadata: {
        size: 0,
        created_at: "",
      },
      thumbnails: {
        300: "",
        600: "",
        1000: "",
      },
      url: "",
      text: "",
      textID: "",
    },
    initWelcomePage() {
      this.$watch("showModal", (showModal) => {
        this.onChangeShowModal(showModal);
      });
    },
    async onChangeShowModal(showModal) {
      await this.getImgText();
      await this.getImgTextID();
    },
    onChangeTab(tab) {
      if (tab === "Text ID") {
        this.getImgTextID();
      }
    },
    async getImgText() {
      try {
        const response = await fetch(
          `/upload/text/${this.selectedImage.filename}.txt`
        );
        if (response.ok) {
          this.selectedImage.text = await response.text();
        }
      } catch (error) {
        console.error(error);
      }
      return;
    },
    async getImgTextID() {
      this.selectedImage.textID = "Loading..."
      const data = JSON.stringify({
        from: "en",
        to: "id",
        text: this.selectedImage.text,
      });
      try {
        const response = await fetch(`/api/translate`, {
          method: "POST",
          body: data,
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        });
        if (response.ok) {
          const data = await response.json();
          this.selectedImage.textID = data.text;
        }
      } catch (error) {
        console.error(error);
      }
      return;
    },
    getObj(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
  };
}
