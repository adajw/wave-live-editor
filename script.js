var position, htmlOut, opOut, xmlOut, appliedOps, unappliedOps, nextOpNum;
var XmlToHtml, lastOpenedElement, htmlRegex, xmlRegex;
position = - 1;
appliedOps = [];
unappliedOps = [];
nextOpNum = 0;
XmlToHtml = {	'line' : 'br',
				'x' : 'y',
				}
lastOpenedElement = [];
htmlRegex = RegExp('(<.*>|.)');
xmlRegex = RegExp('(&#.*;|<.*>|.)');
function Operation(){
	var op = {
		opId : nextOpNum,
		type : '',
		arg : false,}
	return op;
}

/* BASIC FUNCTIONS - These functions are used as 'building blocks' by 
the other ops. */
function insertHTML(what){
	var arr = htmlOut.innerHTML.split(htmlRegex);
	var pt1 = arr.slice(0, position).join('');
	var pt2 = arr.slice(position).join('');
	htmlOut.innerHTML = pt1 + what + pt2;
	}
function insertXML(what){
	var arr = xmlOut.innerHTML.split(xmlRegex);
	var pt1 = arr.slice(0, position).join('');
	var pt2 = arr.slice(position).join('');
	xmlOut.innerHTML = pt1 + what + pt2;
	}
function deleteHTML(num){
	var arr = htmlOut.innerHTML.split(htmlRegex);
	var pt1 = arr.slice(0, position).join('');
	var pt2 = arr.slice(position + num).join('');
	var missing = arr.slice(position, position + num).join('');
	htmlOut.innerHTML = pt1 + pt2;
	return missing; /*Returns the characters that aren't included (for debug and Wave Compliance)*/
	}
function deleteXML(num){
	var arr = xmlOut.innerHTML.split(xmlRegex);
	var pt1 = arr.slice(0, position).join('');
	var pt2 = arr.slice(position + num).join('');
	var missing = arr.slice(position, position + num).join('');
	xmlOut.innerHTML = pt1 + pt2;
	return missing; /*Returns the characters that aren't included (for debug and Wave Compliance)*/
	}
/* END BASIC FUNCTIONS */
function applyOp(op){
	if (op.type == 'insertCharacters'){
		for (i=0;i<=op.arg.length;i++){
			insertHTML(op.arg.slice(i, i + 1));
			insertXML(op.arg.slice(i, i + 1));
			position = position + 1;
			}
		return true;}
	else if (op.type == 'deleteCharacters'){
		for (i=0;i<=op.arg.length;i++){
			deleteHTML(1);
			deleteXML(1);
			}
		return true;}
	else if (op.type == 'openElement'){
		var htmlString = "<" + XmlToHtml[op.arg] + ">";
		var xmlString = "&#60;" + op.arg + "&#62;";
		insertHTML(htmlString);
		insertXML(xmlString);
		return true;}
	else if (op.type == 'closeElement'){
		var htmlString = "</" + XmlToHtml[op.arg] + ">";
		var xmlString = "&#60;/" + op.arg + "&#62;";
		insertHTML(htmlString);
		insertXML(xmlString);
		return true;}
	else if (op.type == 'retain'){
		position = position + op.arg
		return true;}
	else {
		return false;}
}
function applyNextOp(){
	var op = unappliedOps.shift();
	if (!op){
		return;
		}
	if (applyOp(op)){
		appliedOps.push(op);
		}
	else {
		alert(op);
		}
}

/* OPS - These ops are 'official' Wave Operations */
function insertCharacters(chrs){
	var op = Operation();
	op.type = 'insertCharacters';
	op.arg = chrs;
	unappliedOps.push(op);
	nextOpNum = nextOpNum + 1;
	}
	
function openElement(elementName){
	var op = Operation();
	op.type = 'openElement';
	op.arg = elementName;
	unappliedOps.push(op);
	nextOpNum = nextOpNum + 1;	
	lastOpenedElement.push(elementName);
}

function closeElement(){
	var elementName = lastOpenedElement.pop();
	var htmlString = "</" + XmlToHtml[elementName] + ">";
	var xmlString = "&#60;/" + elementName + "&#62;";
	var op = Operation();
	op.type = 'closeElement';
	op.arg = elementName;
	unappliedOps.push(op);
	nextOpNum = nextOpNum + 1;
}

function getDltChrs(num){
	return 'a' * num;
}

function backspace(num){
	chrs = getDltChrs(num);
	var op = Operation();
	op.type = 'deleteCharacters';
	op.arg = chrs;
	unappliedOps.push(op);
	nextOpNum = nextOpNum + 1;
	}

function handlerKeydown(e) {
	e = e || window.event;
	var keynum;
	if (!!e.keyCode) {keynum = e.keyCode;}
	else if (e.which) {keynum = e.which;}
	if (keynum == 8) {backspace(1); return;}
	if (keynum == 46) {backspace(-1); return;}
	if (keynum == 37) {position = position - 1; return;}
	if (keynum == 39) {position = position + 1; return;}
	if (keynum == 13) {openElement('line');closeElement(); return;}
	opOut.innerHTML = opOut.innerHTML + keynum + '=' + position + '/';
}

function handlerKeypress(e) {
	e = e || window.event;
	var charCode = e.charCode || e.keyCode;
	var keyCode = e.which || e.keyCode;
	insertCharacters(String.fromCharCode(charCode));
}

function handlerKeyup(e) {
	applyNextOp();
	}
	
function start() {
document.addEventListener("keydown", handlerKeydown);
document.addEventListener("keypress", handlerKeypress);
document.addEventListener("keyup", handlerKeyup);

xmlOut = document.getElementById('outputxml');
htmlOut = document.getElementById('outputhtml');
opOut = document.getElementById('outputoperations');
openElement('line');
closeElement();
applyNextOp();
applyNextOp();
}
