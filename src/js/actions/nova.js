const ajax = require("../util/ajax"),
	preferenceManager = require("../config/preferenceManager"),
	shared = require("./shared");

const preferences = preferenceManager.get();
// TODO add error if video is being encoded
// {
// 	"success": false,
// 	"data": "We are encoding this video, please check back later"
// }

let nova_getDirect = {
	name: "get direct links",
	requireLinkType: "embed",
	servers: ["nova", "rapidvideo"],
	execute: async (data, setSpinnerText) => {
		await shared.eachEpisode(data, _nova_getDirect, setSpinnerText);
		data.linkType = "direct";
	},
};

//asynchronously gets the direct link
async function _nova_getDirect(ep) {
	if (ep.grabLink.slice(0, 5) == "error") {
		return;
	}
	let response = await ajax.post(`https://www.novelplanet.me/api/source/${ep.grabLink.match(/\/([^/]*?)$/)[1]}`);
	let json = JSON.parse(response.response);
	if (!json.data || json.data.length < 1) {
		ep.grabLink = "error: no sources found";
		return;
	}
	let sources = json.data;

	let parsedQualityPrefs = preferences.general.quality_order.replace(/\s/g, "").split(",");
	for (let i of parsedQualityPrefs) {
		for (let j of sources) {
			if (j.label == i + "p") {
				ep.grabLink = j.file;
				return;
			}
		}
	}
	ep.grabLink = "error: preferred qualities not found";
}

module.exports = [nova_getDirect];