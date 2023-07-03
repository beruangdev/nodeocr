// const { translate } = require("bing-translate-api");
const translate = require("fanyi-google");

exports.postTranslate = async (req, res) => {
  const from = req.body.from || "en";
  const to = req.body.to || "id";
  const text = req.body.text || "";

  try {
    const translatedText = await translate(text, { from, to });
    return res.json(translatedText);
  } catch (error) {
    console.error(error);
  }
  return res.json(null);
};
