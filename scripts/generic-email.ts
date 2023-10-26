import sendEmail from '../email/email';
import { template, EmailData } from './email-util/template';
import * as dotenv from 'dotenv';
import promptSync from 'prompt-sync';
import dbConnect from '../middleware/database';
import User from '../models/user';
import { UserData } from '../types/database';
import { getSubject, getHtmlBody, getTextBody, getStatuses, getRecipients, getConfirmation } from './email-util/utils';
dotenv.config();

// UNSENT HACKERS
const UNSENT_HACKERS = [
	[
		'mmuk2002@gmail.com',
		'samuel.j.thompson@vanderbilt.edu',
		'mytsyk.s.v@gmail.com',
		'victorshin1230@gmail.com',
		'ep0596@princeton.edu',
		'sarthak@utexas.edu',
		'ramyasai39@gmail.com',
		'siri.suntichaiwakin@vanderbilt.edu',
		'tronggiao1908@gmail.com',
		'giao.bui@vanderbilt.edu',
		'nathanael.d.tesfaye@vanderbilt.edu',
		'mrnealster22@gmail.com',
		'eileen.hsu@vanderbilt.edu',
		'abolad@iu.edu',
		'ronnie.yalung@vanderbilt.edu',
		'helenchen@gatech.edu',
		'tum99567@temple.edu',
		'sab9920@nyu.edu',
		'qtn2@case.edu',
		'junhao.hui@vanderbilt.edu',
		'supriyaaryal2001@gmail.com',
		'cheng.yu.yvonne@gmail.com',
		'weizhi.cao@vanderbilt.edu',
		'xiomara18salazar@gmail.com',
		'jamesdankwah12@gmail.com',
		'dynieme.fms@gmail.com',
		'c.okezie.u@gmail.com',
		'charlespoulin58@gmail.com',
		'laykeijones@gmail.com',
		'kevjin2002@gmail.com',
		'pratisthachand22@gmail.com',
		'john.p.higgins@vanderbilt.edu',
		'minghanyang955@gmail.com',
		'adhwaithnatarajan@gmail.com',
		'logan.deal27@gmail.com',
		'woosterashton48@gmail.com',
		'ngkennise@gmail.com',
		'prithvikarki2@gmail.com',
		'john.j.lee@vanderbilt.edu',
		'jordan100liverpool@gmail.com',
		'manish.acharya@vanderbilt.edu',
		'smamidipaka6@gatech.edu',
		'venusha500@gmail.com',
		'oseremhen.p.ewaleifoh@vanderbilt.edu',
		'krishsharma2308@gmail.com',
		'tiger01tgr@gmail.com',
		'harrygao@wustl.edu',
		'dereksong03@gmail.com',
		'unnathiutpal6@gmail.com',
		'alexiliarski@gmail.com',
	],
	[
		's.nurozturk2@gmail.com',
		'emmanuellaumoye18@gmail.com',
		'bamlak.sebil@gmail.com',
		'dhuhaa.fazili@vanderbilt.edu',
		'banik.sprihanjay@gmail.com',
		'zachary.r.fleisch@vanderbilt.edu',
		'maddyb3802@gmail.com',
		'lisa.yang@vanderbilt.edu',
		'panthiaashish84@gmail.com',
		'masont.wilhoite@gmail.com',
		'sdembured@gmail.com',
		'yug.goyal46@utexas.edu',
		'rhea.sacheti@gmail.com',
		'eric1eric2eric3eric4eric5@outlook.com',
		'adrian.p.alexander@vanderbilt.edu',
		'lenawu24@gmail.com',
		'einargs@gmail.com',
		'teyon.m.herring@vanderbilt.edu',
		'periwardnyc@gmail.com',
		'muhao.liu@vanderbilt.edu',
		'tausif.samin@vanderbilt.edu',
		'kahanere@gmail.com',
		'pathakishan333@gmail.com',
		'nik.huffmon@yahoo.com',
		'haoyund@sas.upenn.edu',
		'ehechmer@vols.utk.edu',
		'shirling.xu@gmail.com',
		'laurenlevins@gmail.com',
		'shi.ting@northeastern.edu',
		'javiercastellon82@gmail.com',
		'joanna.a.hsieh@vanderbilt.edu',
		'xuanwei.chang@vanderbilt.edu',
		'preciousonah12@gmail.com',
		'mirsaidovamokhinur@gmail.com',
		'yusuffaheedahwhc@gmail.com',
		'ajohnofficial2020@gmail.com',
		'agbidisunday@gmail.com',
		'aliumurtadaa@gmail.com',
		'somtofrancis380@gmail.com',
		'oledibe.francis@philander.edu',
		'wogupearl@gmail.com',
		'atioluwanimofe@gmail.com',
		'davidfaleye360@gmail.com',
		'enesidaniel.120064@gmail.com',
		'mnelly.sec@gmail.com',
		'rohankansal05@gmail.com',
		'zhaoxuan.zhu@vanderbilt.edu',
		'nsubedi@go.olemiss.edu',
		'anthony.m.chuang@vanderbilt.edu',
		'kingobiomaeze2020@gmail.com',
	],
	[
		'binh.t.ho@vanderbilt.edu',
		'hanliang.xu@vanderbilt.edu',
		'ajagbefolashade0@gmail.com',
		'hridizaroy@gmail.com',
		'zachary.t.gillette@vanderbilt.edu',
		'sobenna.p.onwumelu@vanderbilt.edu',
		'eileen.zheng@vanderbilt.edu',
		'connie.l.kang@vanderbilt.edu',
		'samyogk35@gmail.com',
		'rio.angan@gmail.com',
		'isabella.m.gomez@vanderbilt.edu',
		'franklinudensi@gmail.com',
		'franklin.c.udensi@vanderbilt.edu',
		'julia.p.zhang@vanderbilt.edu',
		'katherine.oung@vanderbilt.edu',
		'ritvik.singh@vanderbilt.edu',
		'nathaniel.s.amato@vanderbilt.edu',
		'nguyensydang@gmail.com',
		'brandman211@gmail.com',
		'oluwatishelala@gmail.com',
		'isaac.m.giraldo@vanderbilt.edu',
		'hokyun.son@vanderbilt.edu',
		'vishomallaoli1@gmail.com',
		'jessezhong783@gmail.com',
		'saathviga9605@gmail.com',
		'jasmine.d.sun@vanderbilt.edu',
		'ogochukwuuba16@gmail.com',
		'ejaifeobuks@gmail.com',
		'ilayda.koca@vanderbilt.edu',
		'zhenxuan.shao@vanderbilt.edu',
		'cdh.create@gmail.com',
		'gurubazawada@gmail.com',
		'pratyushkhanalpk@gmail.com',
		'dkzibr2@gmail.com',
		'aliparslan@outlook.com',
		'tally.w.szakel@vanderbilt.edu',
		'basnes0@sewanee.edu',
		'stanley.zheng@vanderbilt.edu',
		'ankit.janamanchi@vanderbilt.edu',
		'naol.z.wordoffa@vanderbilt.edu',
		'shubham@majorleaguehacking.com',
		'eli.l.gripenstraw@vanderbilt.edu',
		'daniel.t.little@vanderbilt.edu',
		'matthew.zhou@vanderbilt.edu',
		'ryan.khairollahi@vanderbilt.edu',
		'nathan.hammond@vanderbilt.edu',
		'thu.nguyen@vanderbilt.edu',
		'parker.d.palermo@vanderbilt.edu',
		'alexander.goldberg@intel.com',
		'kshitijs.work@gmail.com',
	],
	[
		'tejaskalpathi@gmail.com',
		'demirezenmert@gmail.com',
		'sankhyasiva16@gmail.com',
		'susheel0501@gmail.com',
		'lauren.e.johnson.1@vanderbilt.edu',
		'justin.d.munoz@vanderbilt.edu',
		'sophia.stoyanova@vanderbilt.edu',
		'aarij.atiq@vanderbilt.edu',
		'kachchhavadivyansh@gmail.com',
		'haoran.qin@vanderbilt.edu',
		'yiwei.wang@vanderbilt.edu',
		'xiaoqingmei5@gmail.com',
		'muhammad.z.rahman@vanderbilt.edu',
		'runda.li@vanderbilt.edu',
		'ryan.c.taylor@vanderbilt.edu',
		'xxspycedxx@gmail.com',
		'daniil.shatokhin@vanderbilt.edu',
		'lucianasanchez20152@gmail.com',
		'vedanttewari2000@gmail.com',
		'ugonnahnwaka300@gmail.com',
		'enya.f.bullard@vanderbilt.edu',
		'nathaniel.t.dalbert@vanderbilt.edu',
		'yifuzheng911018@gmail.com',
		'ajt200@scarletmail.rutgers.edu',
		'rohandeshpande832@gmail.com',
		'aditi.venkatesh@live.com',
		'kommiadithya@gmail.com',
		'mehankitdas085@gmail.com',
		'arctangent20@yahoo.com',
		'koppakev@gmail.com',
		'sabrina.bradshaw510@gmail.com',
		'qihao.yang@vanderbilt.edu',
		'vinayviswanathan821@gmail.com',
		'kylieburgess2021@gmail.com',
		'zinean1234@gmail.com',
		'kangbai.yan@vanderbilt.edu',
		'bowen.wang.1@vanderbilt.edu',
		'mini.moonachie@gmail.com',
		'kaijie.xu@vanderbilt.edu',
		'yibao.zhang@vanderbilt.edu',
		'abdelme0@sewanee.edu',
		'franny.is.reana@gmail.com',
		'mckenz318@gmail.com',
		'aaron.liu@vanderbilt.edu',
		'varun.bussa@vanderbilt.edu',
		'lolita.t.rozenbaum@vanderbilt.edu',
		'kaicie.l.kidd@vanderbilt.edu',
		'johann.s.west@vanderbilt.edu',
		'yurui.xu@vanderbilt.edu',
		'siyuan.yi@vanderbilt.edu',
	],
	[
		'anda.liang@vanderbilt.edu',
		'colbert.e.kainz@vanderbilt.edu',
		'sean.c.richardson@vanderbilt.edu',
		'khushaan.u.jani@vanderbilt.edu',
		'scout.s.dahir@vanderbilt.edu',
		'jpg5wq@virginia.edu',
		'jacob.j.davey@vanderbilt.edu',
		'citiana.a.frew@vanderbilt.edu',
		'ashlea.byram@gmail.com',
		'ziyuan.guo@vanderbilt.edu',
		'tahir.va3@gmail.com',
		'jonathan.s.kim@vanderbilt.edu',
		'lyla.s.kiani@vanderbilt.edu',
		'tapan.s.sidhwani@vanderbilt.edu',
		'kevin.l.chen@vanderbilt.edu',
		'wen.chenwen0924@gmail.com',
		'cindy.s.ho@vanderbilt.edu',
		'md.mashiur.rahman.khan@vanderbilt.edu',
		'chang.dong@vanderbilt.edu',
		'lynn@codepath.org',
		'brian.l.tang@vanderbilt.edu',
		'daniel.park@vanderbilt.edu',
		'trucnguyen_2025@depauw.edu',
		'andrewliu245@gmail.com',
		'joellenholt@gmail.com',
		'rolandsaavedra22@gmail.com',
		'ben.franklin.liu@gmail.com',
		'bowersjm116@gmail.com',
		'mpatel65@vols.utk.edu',
		'fowobaje2005@gmail.com',
		'jack.k.garritano@vanderbilt.edu',
		'mattliusa@gmail.com',
		'stewart.s.geisz@vanderbilt.edu',
		'jerald.arden.p.freeman@vanderbilt.edu',
		'simon.j.kassman@vanderbilt.edu',
		'owen.a.rice@vanderbilt.edu',
		'jiheng.li.1@vanderbilt.edu',
		'moisedete@gmail.com',
		'peter.m.seam@vanderbilt.edu',
		'jiarui.wang@vanderbilt.edu',
		'bishalbipul0@gmail.com',
		'navarajpanday4470@gmail.com',
		'thao.h.hoang@vanderbilt.edu',
		'laura.d.bryant@vanderbilt.edu',
		'mumtes13@gmail.com',
		'lena.wu@vanderbilt.edu',
		'mnmanasnavale@gmail.com',
		'dgzct11@icloud.com',
		'clarlczz143@gmail.com',
		'gbarnard08@gmail.com',
	],
	[
		'jackson.h.lanier@vanderbilt.edu',
		'kaiwen.shi@vanderbilt.edu',
		'atifmomin12345@gmail.com',
		'brandon.l.chandler@vanderbilt.edu',
		'yiding.gou@vanderbilt.edu',
		'qingyun.yang@vanderbilt.edu',
		'ayushghimire08@gmail.com',
		'sajan123poudel4@gmail.com',
		'antonio.vasquez1571@gmail.com',
		'galen.wei@vanderbilt.edu',
		'nizovskiy2004@mail.ru',
		'david.nizovsky@vanderbilt.edu',
		'sydney.kong@vanderbilt.edu',
		'llhou@umass.edu',
		'galenwei4@gmail.com',
		'lojjchen.job@gmail.com',
		'pranavbatchu05@gmail.com',
		'longji.j.chen@vanderbilt.edu',
		'yifan.wei@vanderbilt.edu',
		'hcy1324355@sina.com',
		'miyannishar786@gmail.com',
		'alice.y.huh@vanderbilt.edu',
		'avishkank@gmail.com',
		'nisala.a.kalupahana@vanderbilt.edu',
		'hello@nisa.la',
		'david.j.huang@vanderbilt.edu',
		'jiayi.wu@vanderbilt.edu',
		'mohams3ios01@gmail.com',
		'emre.e.bilge@vanderbilt.edu',
		'alniksarli@davidson.edu',
		'murtazanikzad1@gmail.com',
		'bambobtim@gmail.com',
		'dana.n.izadpanah@vanderbilt.edu',
		'vasco.s.singh@vanderbilt.edu',
		'gloria0701zhang@gmail.com',
		'rana.muhammad.shahroz.khan@vanderbilt.edu',
		'ianboraks@gmail.com',
		'arnavjha2005@gmail.com',
		'jocelyn.ni@vanderbilt.edu',
		'jiahe.gao@vanderbilt.edu',
		'marcus.g.pranga@vanderbilt.edu',
		'nafees-ul.haque@vanderbilt.edu',
		'manas.s.malla@vanderbilt.edu',
		'srinidhiaru@gmail.com',
		'scott.lee1992@gmail.com',
		'gqmingmouse@gmail.com',
		'adriannapinzariu@gmail.com',
		'qianlidong0@gmail.com',
		'elliot.boualaphanh@gmail.com',
		'corbintinnon@gmail.com',
	],
	[
		'joyce.j.huang@vanderbilt.edu',
		'connor.r.brugger@vanderbilt.edu',
		'adain.p.luckadue@vanderbilt.edu',
		'vince.lin@vanderbilt.edu',
		'euniceh.info@gmail.com',
		'janieshin05@gmail.com',
		'natalie.m.dimov@vanderbilt.edu',
		'folushovictoradeyemi@gmail.com',
		'haoli.yin@vanderbilt.edu',
		'saatvikagrawal03@gmail.com',
		'fariskarim2000@gmail.com',
		'megan.z.wang@vanderbilt.edu',
		'kevin.liao@vanderbilt.edu',
		'barbarabombaci16@gmail.com',
		'rashid.osman@vanderbilt.edu',
		'zoha18082002@gmail.com',
		'songqi.wang@vanderbilt.edu',
		's.ranjitkumar@gmail.com',
		'reagan.f.massey@vanderbilt.edu',
		'alicia.cook2020@gmail.com',
		'harij2266@gmail.com',
		'marniehartill@gmail.com',
		'hadennaomi67@gmail.com',
		'aidanlorenz@gmail.com',
		'mahd.mohsin@vanderbilt.edu',
		'kyler.s.kang@vanderbilt.edu',
		'fardeen.e.bablu@vanderbilt.edu',
		'weiyu.yan@vanderbilt.edu',
		'harrisms305@gmail.com',
		'jana.j.yan@vanderbilt.edu',
		'l65.fread@gmail.com',
		'adhungana@colgate.edu',
		'manojgrg314@gmail.com',
		'oseremhenpeace@gmail.com',
		'raffayshahid@hotmail.com',
		'chasetcallahan@gmail.com',
		'virginiaedor@gmail.com',
		'leblanc2042@gmail.com',
		'rohit.gogi12@gmail.com',
		'paruldhariwal01@gmail.com',
		'saranshs557@gmail.com',
		'fernandorafaeljosh@gmail.com',
		'tomriddlealbussirius@gmail.com',
		'allikrumm7@gmail.com',
		'sydney.c.brown@vanderbilt.edu',
		'tanya.e.das@vanderbilt.edu',
		'michael.y.wang@vanderbilt.edu',
		'lanastertrop@gmail.com',
		'mrdanielhenricks@yahoo.com',
		'kevin.song.1@vanderbilt.edu',
	],
	[
		'j74xiao@uwaterloo.ca',
		'tevin.park@vanderbilt.edu',
		'chicklenickle@gmail.com',
		'lauradetbryant@gmail.com',
		'zhumeich@umich.edu',
		'liyu.huang@vanderbilt.edu',
		'brina.a.ratangee@vanderbilt.edu',
		'ekarunakar24mb7@gmail.com',
		'idrisim@beloit.edu',
		'mustafaadel16010@gmail.com',
		'thunderethan1@gmail.com',
		'enamhaq@gmail.com',
		'anitej185@gmail.com',
		'samantha.m.mcloughlin@vanderbilt.edu',
		'suhaaspk@gmail.com',
		'jenetaifeatu.a.nwosu@vanderbilt.edu',
		'aarnabhuptani@gmail.com',
		'andrew.c.cascio@vanderbilt.edu',
		'william.r.qian@vanderbilt.edu',
		'jacob.w.arnold@vanderbilt.edu',
		'joseph.k.rhee@vanderbilt.edu',
		'ethan.j.xu@vanderbilt.edu',
		'sjt88steph@gmail.com',
		'trisha.mazumdar@vanderbilt.edu',
		'isabella.g.nelson@vanderbilt.edu',
		'tioluwanimofeadesanya@gmail.com',
		'jesse.s.zhong@vanderbilt.edu',
		'divija.katakam@vanderbilt.edu',
		'deosambridhi@gmail.com',
		'musaabdulrafiu19@gmail.com',
		'kareemelgohry1@gmail.com',
		'christin.ann.s.sanchez@vanderbilt.edu',
		'abo.luna1@gmail.com',
		'alisemihural@gmail.com',
		'terra.l.jang@vanderbilt.edu',
		'drewquinonez05@yahoo.com',
		'ltruong@vols.utk.edu',
		'rushi.v.patel@vanderbilt.edu',
		'chuci.liu@vanderbilt.edu',
		'jonathanyashayev11@gmail.com',
		'ryan.li@vanderbilt.edu',
		'joseph.a.zou@vanderbilt.edu',
		'celeste_li@icloud.com',
	],
];

const prompt = promptSync({ sigint: true });

const emailData: EmailData = {
	emails: [],
	subject: '',
	htmlBody: '',
	textBody: '',
};

const promptUser = async () => {
	// Subject
	const subject = getSubject(prompt);

	// HTML body
	const { htmlBody, htmlPath } = await getHtmlBody(prompt);

	// Plain text body
	const { textBody, textPath } = await getTextBody(prompt);

	// ApplicationStatus(es)
	const statuses = getStatuses(prompt);

	// Email addresses
	const { chunkedEmails, emails } = await getRecipients(statuses);

	// // TODO: EXTRACT INTO SEPARATE FUNCTION
	// // 		parameters: prompt, statuses
	// // 		include the slicing stuffs
	// // 		return: chunkedEmails, total number of emails
	// await dbConnect(process.env.DATABASE_URL);
	//
	// const query = {
	// 	$and: [{ userType: 'HACKER' }, { applicationStatus: { $in: statuses } }],
	// };
	//
	// const hackers: UserData[] = await User.find(query);
	//
	// // SLICE EMAILS INTO CHUNKS OF 50
	// const chunkSize = 50;
	// const allEmails = hackers.map(hacker => hacker.email);
	// const chunkedEmails = [];
	// for (let i = 0; i < allEmails.length; i += chunkSize) {
	// 	chunkedEmails.push(allEmails.slice(i, i + chunkSize));
	// }
	// console.log(chunkedEmails);
	// // console.log(chunkedEmails.length);
	// // console.log(chunkedEmails[0].length);
	// // console.log(chunkedEmails[1].length);
	// // console.log(allEmails.length);

	// Confirmation
	const inputtedData = {
		'Subject Line': subject,
		'HTML Body': htmlPath,
		'Plain Text Body': textPath,
		'Ok ApplicationStatus(es)': statuses,
		'Number of Recipients': emails.length,
		'First 50 (or so) Recipients': chunkedEmails.length === 0 ? '' : chunkedEmails[0],
	};

	const emailData: EmailData = {
		emails: [],
		subject,
		htmlBody,
		textBody,
	};

	getConfirmation(prompt, inputtedData, emails);

	// // TODO: EXTRACT INTO SEPARATE FUNCTION
	// // 		parameters: emailData, htmlPath, textPath, statuses, total number of emails, chunkedEmails
	// console.log('Here is what you entered: ');
	// const inputtedData = {
	// 	'Subject Line': emailData.subject,
	// 	'HTML Body': htmlPath,
	// 	'Plain Text Body': textPath,
	// 	'Ok ApplicationStatus(es)': statuses,
	// 	'Number of Recipients': emails.length,
	// 	'First 50 (or so) Recipients': chunkedEmails.length === 0 ? '' : chunkedEmails[0],
	// };
	// console.log(inputtedData);

	// let hasConfirmed = prompt('Would you like to send your email? (y/n) ');

	// while (hasConfirmed !== 'y' && hasConfirmed !== 'n') {
	// 	hasConfirmed = prompt('Please enter either y or n: ');
	// }

	// if (hasConfirmed === 'n') {
	// 	console.log('Have a nice day!');
	// 	process.exit(0);
	// }

	return { emailData, chunkedEmails };
};

const execute = async () => {
	const { emailData, chunkedEmails } = await promptUser();

	for (let i = 0; i < chunkedEmails.length; i++) {
		emailData.emails = chunkedEmails[i];
		await sendEmail(template(emailData));
		console.log(chunkedEmails[i]);

		setTimeout(function () {
			console.log('wait has ended!');
		}, 3000);
	}
};

// TODO: REVISE THIS TO BE A FUNCTION FOR SENDING HARDCODED EMAIL LIST
// 		users need to manually update the hard coded email list in this script file
// 		create a diff promptUser function for hard coded emails specifically
// 		OR add a branch in current promptUser funtion for hard coded emails specifically
const execute_UNSENT = async () => {
	await promptUser();

	for (let i = 0; i < UNSENT_HACKERS.length; i++) {
		emailData.emails = UNSENT_HACKERS[i];
		await sendEmail(template(emailData));
		console.log(UNSENT_HACKERS[i]);

		setTimeout(function () {
			console.log('wait has ended!');
		}, 3000);
	}
};

// TODO: allow user to choose between hard coded email list vs queries email list
// 		toggle between using execute() and execute_hardcoded()
(async () => {
	try {
		await execute_UNSENT();
		console.log('Successfully sent email!');
		process.exit(0);
	} catch (err) {
		console.error('Did not successfully send email :(');
		console.error(err);
		process.exit(0);
	}
})();
