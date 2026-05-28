window.siteContentChunks = window.siteContentChunks || [];

window.siteContentChunks.push({
  locales: ["zh-Hans", "zh-Hant", "ja"],
  mode: "prepend",
  picks: [
    {
      slug: "my-pick-item",
      tag: "Reading",
      title: "推荐标题",
      meta: "这里写一句简短说明。",
      copy: "这里写首页和推荐列表会显示的简介。",
      productLink: "https://商品购买链接",
      body: [
        "这里是推荐文章第一段。",
        "这里是推荐文章第二段。",
        "这里是推荐文章第三段。"
      ]
    }
  ]
});
