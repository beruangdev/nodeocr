function imageList() {
  return {
    images: [],
    perPage: 12,
    currentPage: 1,
    totalPages: 0,
    lastImageUrl: 0,

    async init() {
      setInterval(async () => {
        this.fetchImages();
      }, 1000);
    },

    async fetchImages() {
      const response = await fetch(
        `/api/image?page=${this.currentPage}&perPage=${this.perPage}`
      );
      const data = await response.json();

      if (data.data[0]?.url && this.lastImageUrl !== data.data[0]?.url) {
        this.lastImageUrl = data.data[0].url;
        this.images = data.data;
        this.totalPages = Math.ceil(data.total / this.perPage);
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchImages();
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchImages();
      }
    },

    goToPage(pageNumber) {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.currentPage = pageNumber;
        this.fetchImages();
      }
    },
  };
}
