const parser = new HyperDown();
const player = window.JoeConfig.playerAPI;

export default function createPreviewHtml(str) {
	if (!window.JoeConfig.canPreview) return $('.cm-preview-content').html('1. Xem trước bị tắt theo mặc định <br> 2. Nhấp vào nút xem trước ở trên để bật xem trước <br> 3. Nếu trình chỉnh sửa bị treo, hãy thử đóng bản xem trước');

	if (str.indexOf('　') !== -1) {
		str = str.replace(/　/g, '&emsp;');
	}

	/* 生成html */
	str = parser.makeHtml(str);

	str = str.replace(/\:\:\(\s*(1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|35|36|37|38|39|40|41|42|43|44|45|46|47|48|49|50|51|52|53|54|55|56|57|58|59|60|61|62|63|64|65|66|67|68|69)\s*\)/g, function ($0, $1) {
		$1 = encodeURI($1).replace(/%/g, '');
		return `<img class="owo" src="${window.JoeConfig.themeURL}assets/owo/paopao/${$1}_2x.png" />`;
	});

	str = str.replace(/\:\@\(\s*(71|72|73|74|75|76|77|78|79|80|81|82|83|84|85|86|87|88|89|90|91|92|93|94|95|96|97|98|99|100|101|102|103|104|105|106|107|108|109|110|111|112|113|114|115|116|117|118|119|120|121|122|123|124|125|126|127|128|129|130|131|132)\s*\)/g, function ($0, $1) {
		$1 = encodeURI($1).replace(/%/g, '');
		return `<img class="owo" src="${window.JoeConfig.themeURL}assets/owo/aru/${$1}_2x.png" />`;
	});

	if (str.indexOf('{lamp') !== -1) {
		str = str.replace(/{lamp\/}/g, '<span class="joe_lamp"></span>');
	}
	if (str.indexOf('{x}') !== -1) {
		str = str.replace(/{x}/g, '<input type="checkbox" class="joe_checkbox" checked disabled></input>');
	}
	if (str.indexOf('{ }') !== -1) {
		str = str.replace(/{ }/g, '<input type="checkbox" class="joe_checkbox" disabled></input>');
	}
	if (str.indexOf('{mtitle') !== -1) {
		str = str.replace(/{mtitle([^}]*)\/}/g, '<joe-mtitle $1></joe-mtitle>');
	}
	if (str.indexOf('{dplayer') !== -1) {
		str = str.replace(/{dplayer([^}]*)\/}/g, '<joe-dplayer player="' + player + '" $1></joe-dplayer>');
	}
	if (str.indexOf('{bilibili') !== -1) {
		str = str.replace(/{bilibili([^}]*)\/}/g, '<joe-bilibili $1></joe-bilibili>');
	}
	if (str.indexOf('{music-list') !== -1) {
		str = str.replace(/{music-list([^}]*)\/}/g, '<joe-mlist $1></joe-mlist>');
	}
	if (str.indexOf('{music') !== -1) {
		str = str.replace(/{music([^}]*)\/}/g, '<joe-music $1></joe-music>');
	}
	if (str.indexOf('{mp3') !== -1) {
		str = str.replace(/{mp3([^}]*)\/}/g, '<joe-mp3 $1></joe-mp3>');
	}
	if (str.indexOf('{abtn') !== -1) {
		str = str.replace(/{abtn([^}]*)\/}/g, '<joe-abtn $1></joe-abtn>');
	}
	if (str.indexOf('{anote') !== -1) {
		str = str.replace(/{anote([^}]*)\/}/g, '<joe-anote $1></joe-anote>');
	}
	if (str.indexOf('{copy') !== -1) {
		str = str.replace(/{copy([^}]*)\/}/g, '<joe-copy $1></joe-copy>');
	}
	if (str.indexOf('{dotted') !== -1) {
		str = str.replace(/{dotted([^}]*)\/}/g, '<joe-dotted $1></joe-dotted>');
	}
	if (str.indexOf('{message') !== -1) {
		str = str.replace(/{message([^}]*)\/}/g, '<joe-message $1></joe-message>');
	}
	if (str.indexOf('{progress') !== -1) {
		str = str.replace(/{progress([^}]*)\/}/g, '<joe-progress $1></joe-progress>');
	}
	if (str.indexOf('{cloud') !== -1) {
		str = str.replace(/{cloud([^}]*)\/}/g, '<joe-cloud $1></joe-cloud>');
	}
	if (str.indexOf('{hide') !== -1) {
		str = str.replace(/{hide[^}]*}([\s\S]*?){\/hide}/g, '<joe-hide></joe-hide>');
	}
	if (str.indexOf('{card-default') !== -1) {
		str = str.replace(/{card-default([^}]*)}([\s\S]*?){\/card-default}/g, '<section style="margin-bottom: 15px"><joe-card-default $1><span class="_temp" style="display: none">$2</span></joe-card-default></section>');
	}
	if (str.indexOf('{callout') !== -1) {
		str = str.replace(/{callout([^}]*)}([\s\S]*?){\/callout}/g, '<section style="margin-bottom: 15px"><joe-callout $1><span class="_temp" style="display: none">$2</span></joe-callout></section>');
	}
	if (str.indexOf('{card-describe') !== -1) {
		str = str.replace(/{card-describe([^}]*)}([\s\S]*?){\/card-describe}/g, '<section style="margin-bottom: 15px"><joe-card-describe $1><span class="_temp" style="display: none">$2</span></joe-card-describe></section>');
	}
	if (str.indexOf('{tabs') !== -1) {
		str = str.replace(/{tabs}([\s\S]*?){\/tabs}/g, '<section style="margin-bottom: 15px"><joe-tabs><span class="_temp" style="display: none">$1</span></joe-tabs></section>');
	}
	if (str.indexOf('{card-list') !== -1) {
		str = str.replace(/{card-list}([\s\S]*?){\/card-list}/g, '<section style="margin-bottom: 15px"><joe-card-list><span class="_temp" style="display: none">$1</span></joe-card-list></section>');
	}
	if (str.indexOf('{timeline') !== -1) {
		str = str.replace(/{timeline}([\s\S]*?){\/timeline}/g, '<section style="margin-bottom: 15px"><joe-timeline><span class="_temp" style="display: none">$1</span></joe-timeline></section>');
	}
	if (str.indexOf('{collapse') !== -1) {
		str = str.replace(/{collapse}([\s\S]*?){\/collapse}/g, '<section style="margin-bottom: 15px"><joe-collapse><span class="_temp" style="display: none">$1</span></joe-collapse></section>');
	}
	if (str.indexOf('{alert') !== -1) {
		str = str.replace(/{alert([^}]*)}([\s\S]*?){\/alert}/g, '<section style="margin-bottom: 15px"><joe-alert $1><span class="_temp" style="display: none">$2</span></joe-alert></section>');
	}
	if (str.indexOf('{gird') !== -1) {
		str = str.replace(/{gird([^}]*)}([\s\S]*?){\/gird}/g, '<section style="margin-bottom: 15px"><joe-gird $1><span class="_temp" style="display: none">$2</span></joe-gird></section>');
	}
	$('.cm-preview-content').html(str);
	$('.cm-preview-content p:empty').remove();
	Prism.highlightAll();
}
