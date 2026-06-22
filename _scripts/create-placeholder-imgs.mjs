import fs from "node:fs";
import path from "node:path";

const files = [
	"src/coplanauts/assets/img/tap.png",
	"src/coplanauts/assets/img/ico-zoom.png",
	"src/coplanauts/assets/img/concept/bg-gard.svg",
	"src/coplanauts/assets/img/concept/title-dot.svg",
	"src/coplanauts/assets/img/showroom/arrow.svg",
	"src/coplanauts/assets/img/showroom/line01.svg",
	"src/coplanauts/assets/img/showroom/line02.svg",
	"src/coplanauts/assets/img/showroom/line03.svg",
	"src/coplanauts/assets/img/showroom/line04.svg",
	"src/coplanauts/assets/img/showroom/line05.svg",
	"src/coplanauts/assets/img/showroom/line06.svg",
	"src/coplanauts/assets/img/showroom/line07.svg",
	"src/coplanauts/assets/img/showroom/ico-true.svg",
	"src/coplanauts/assets/img/showroom/ico-false.svg",
	"src/coplanauts/assets/img/products/cloud.svg",
	"src/coplanauts/assets/img/products/arrow_icon.svg",
];

for (const f of files) {
	fs.mkdirSync(path.dirname(f), { recursive: true });
	if (!fs.existsSync(f)) {
		fs.writeFileSync(f, "");
		console.log("created:", f);
	} else {
		console.log("exists:", f);
	}
}
