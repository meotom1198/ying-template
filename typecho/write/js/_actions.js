import { undo, redo } from '@codemirror/history';
export default class JoeAction {
	constructor() {
		$('body').append(`
				<div class="cm-modal">
						<div class="cm-modal__wrapper">
								<div class="cm-modal__wrapper-header">
										<div class="cm-modal__wrapper-header--text"></div>
										<div class="cm-modal__wrapper-header--close">×</div>
								</div>
								<div class="cm-modal__wrapper-bodyer"></div>
								<div class="cm-modal__wrapper-footer">
										<button class="cm-modal__wrapper-footer--cancle">Hủy bỏ</button>
										<button class="cm-modal__wrapper-footer--confirm">Ok</button>
								</div>
						</div>
				</div>
		`);
		$('.cm-modal__wrapper-footer--cancle, .cm-modal__wrapper-header--close').on('click', () => $('.cm-modal').removeClass('active'));
		$('.cm-modal__wrapper-footer--confirm').on('click', () => {
			this.options.confirm();
			$('.cm-modal').removeClass('active');
		});
	}
	_openModal(options = {}) {
		const _options = {
			title: 'Nhắc',
			innerHtml: 'Nội dung',
			hasFooter: true,
			confirm: () => { },
			handler: () => { }
		};
		this.options = Object.assign(_options, options);
		$('.cm-modal__wrapper-header--text').html(this.options.title);
		$('.cm-modal__wrapper-bodyer').html(this.options.innerHtml);
		this.options.hasFooter ? $('.cm-modal__wrapper-footer').show() : $('.cm-modal__wrapper-footer').hide();
		$('.cm-modal').addClass('active');
		this.options.handler();
	}
	_getLineCh(cm) {
		const head = cm.state.selection.main.head;
		const line = cm.state.doc.lineAt(head);
		return head - line.from;
	}
	_replaceSelection(cm, str) {
		cm.dispatch(cm.state.replaceSelection(str));
	}
	_setCursor(cm, pos) {
		cm.dispatch({ selection: { anchor: pos } });
	}
	_getSelection(cm) {
		return cm.state.sliceDoc(cm.state.selection.main.from, cm.state.selection.main.to);
	}
	_insetAmboText(cm, str) {
		const cursor = cm.state.selection.main.head;
		const selection = this._getSelection(cm);
		this._replaceSelection(cm, ` ${str + selection + str} `);
		if (selection === '') this._setCursor(cm, cursor + str.length + 1);
		cm.focus();
	}
	_createTableLists(cm, url, activeTab = '', modalTitle) {
		$.ajax({
			url,
			dataType: 'json',
			success: res => {
				let tabbarStr = '';
				let listsStr = '';
				for (let key in res) {
					const arr = res[key].split(' ');
					tabbarStr += `<div class="tabbar-item ${key === activeTab ? 'active' : ''}" data-show="${key}">${key}</div>`;
					listsStr += `<div class="lists ${key === activeTab ? 'active' : ''}" data-show="${key}">${arr.map(item => `<div class="lists-item" data-text="${item}">${item}</div>`).join(' ')}</div>`;
				}
				this._openModal({
					title: modalTitle,
					hasFooter: false,
					innerHtml: `<div class="tabbar">${tabbarStr}</div>${listsStr}`,
					handler: () => {
						$('.cm-modal__wrapper-bodyer .tabbar-item').on('click', function () {
							const activeTab = $(this);
							const show = activeTab.attr('data-show');
							const tabbar = $('.cm-modal__wrapper-bodyer .tabbar');
							activeTab.addClass('active').siblings().removeClass('active');
							tabbar.stop().animate({
								scrollLeft: activeTab[0].offsetLeft - tabbar[0].offsetWidth / 2 + activeTab[0].offsetWidth / 2 - 15
							});
							$('.cm-modal__wrapper-bodyer .lists').removeClass('active');
							$(".cm-modal__wrapper-bodyer .lists[data-show='" + show + "']").addClass('active');
						});
						const _this = this;
						$('.cm-modal__wrapper-bodyer .lists-item').on('click', function () {
							const text = $(this).attr('data-text');
							_this._replaceSelection(cm, ` ${text} `);
							$('.cm-modal').removeClass('active');
							cm.focus();
						});
					}
				});
			}
		});
	}
	_updateScroller(el, target) {
		const percentage = el.scrollTop / (el.scrollHeight - el.offsetHeight);
		target.scrollTop = percentage * (target.scrollHeight - target.offsetHeight);
	}
	handleFullScreen(el) {
		el.toggleClass('active');
		$('body').toggleClass('fullscreen');
		$('.cm-container').toggleClass('fullscreen');
		$('.cm-preview').width(0);
	}
	handlePublish() {
		$('#btn-submit').click();
	}
	handleUndo(cm) {
		undo(cm);
		cm.focus();
	}
	handleRedo(cm) {
		redo(cm);
		cm.focus();
	}
	handleIndent(cm) {
		this._replaceSelection(cm, '　');
		cm.focus();
	}
	handleTime(cm) {
		const time = new Date();
		const _Year = time.getFullYear();
		const _Month = String(time.getMonth() + 1).padStart(2, 0);
		const _Date = String(time.getDate()).padStart(2, 0);
		const _Hours = String(time.getHours()).padStart(2, 0);
		const _Minutes = String(time.getMinutes()).padStart(2, 0);
		const _Seconds = String(time.getSeconds()).padStart(2, 0);
		const _Day = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][time.getDay()];
		const _time = `${this._getLineCh(cm) ? '\n' : ''}${_Year}-${_Month}-${_Date} ${_Hours}:${_Minutes}:${_Seconds} ${_Day}\n`;
		this._replaceSelection(cm, _time);
		cm.focus();
	}
	handleHr(cm) {
		const str = `${this._getLineCh(cm) ? '\n' : ''}\n------------\n\n`;
		this._replaceSelection(cm, str);
		cm.focus();
	}
	handleClean(cm) {
		cm.dispatch({ changes: { from: 0, to: cm.state.doc.length, insert: '' } });
		cm.focus();
	}
	handleOrdered(cm) {
		const selection = this._getSelection(cm);
		if (selection === '') {
			const str = (this._getLineCh(cm) ? '\n\n' : '') + '1. ';
			this._replaceSelection(cm, str);
		} else {
			const selectionText = selection.split('\n');
			for (let i = 0, len = selectionText.length; i < len; i++) {
				selectionText[i] = selectionText[i] === '' ? '' : i + 1 + '. ' + selectionText[i];
			}
			const str = (this._getLineCh(cm) ? '\n' : '') + selectionText.join('\n');
			this._replaceSelection(cm, str);
		}
		cm.focus();
	}
	handleUnordered(cm) {
		const selection = this._getSelection(cm);
		if (selection === '') {
			const str = (this._getLineCh(cm) ? '\n' : '') + '- ';
			this._replaceSelection(cm, str);
		} else {
			const selectionText = selection.split('\n');
			for (let i = 0, len = selectionText.length; i < len; i++) {
				selectionText[i] = selectionText[i] === '' ? '' : '- ' + selectionText[i];
			}
			const str = (this._getLineCh(cm) ? '\n' : '') + selectionText.join('\n');
			this._replaceSelection(cm, str);
		}
		cm.focus();
	}
	handleQuote(cm) {
		const selection = this._getSelection(cm);
		if (selection === '') {
			this._replaceSelection(cm, `${this._getLineCh(cm) ? '\n' : ''}> `);
		} else {
			const selectionText = selection.split('\n');
			for (let i = 0, len = selectionText.length; i < len; i++) {
				selectionText[i] = selectionText[i] === '' ? '' : '> ' + selectionText[i];
			}
			const str = (this._getLineCh(cm) ? '\n' : '') + selectionText.join('\n');
			this._replaceSelection(cm, str);
		}
		cm.focus();
	}
	handleDownload(cm) {
		const title = $('#title').val() || 'Bài viết mới';
		const aTag = document.createElement('a');
		let blob = new Blob([cm.state.doc.toString()]);
		aTag.download = title + '.md';
		aTag.href = URL.createObjectURL(blob);
		aTag.click();
		URL.revokeObjectURL(blob);
	}
	handleTitle(cm, tool) {
		const item = $(`
			<div class="cm-tools-item" title="${tool.title}">
				${tool.innerHTML}
				<div class="cm-tools__dropdown">
					<div class="cm-tools__dropdown-item" data-text="# "> H1 </div>
					<div class="cm-tools__dropdown-item" data-text="## "> H2 </div>
					<div class="cm-tools__dropdown-item" data-text="### "> H3 </div>
					<div class="cm-tools__dropdown-item" data-text="#### "> H4 </div>
					<div class="cm-tools__dropdown-item" data-text="##### "> H5 </div>
					<div class="cm-tools__dropdown-item" data-text="###### "> H6 </div>
				</div>
			</div>
		`);
		item.on('click', function (e) {
			e.stopPropagation();
			$(this).toggleClass('active');
		});
		const _this = this;
		item.on('click', '.cm-tools__dropdown-item', function (e) {
			e.stopPropagation();
			const text = $(this).attr('data-text');
			if (_this._getLineCh(cm)) _this._replaceSelection(cm, '\n\n' + text);
			else _this._replaceSelection(cm, text);
			item.removeClass('active');
			cm.focus();
		});
		$(document).on('click', () => item.removeClass('active'));
		$('.cm-tools').append(item);
	}
	handleLink(cm) {
		this._openModal({
			title: 'Chèn liên kết',
			innerHtml: `
                <div class="fitem">
                    <label>Tiêu đề liên kết</label>
                    <input autocomplete="off" name="title" placeholder="Vui lòng nhập tiêu đề liên kết"/>
                </div>
                <div class="fitem">
                    <label>Địa chỉ liên kết</label>
                    <input autocomplete="off" name="url" placeholder="Vui lòng nhập địa chỉ liên kết"/>
                </div>
            `,
			confirm: () => {
				const title = $(".cm-modal input[name='title']").val() || 'Test';
				const url = $(".cm-modal input[name='url']").val() || 'http://';
				this._replaceSelection(cm, ` [${title}](${url}) `);
				cm.focus();
			}
		});
	}
	handleImage(cm) {
		this._openModal({
			title: 'Chèn ảnh',
			innerHtml: `
                <div class="fitem">
                    <label>Tên hình ảnh</label>
                    <input autocomplete="off" name="title" placeholder="Vui lòng nhập tên hình ảnh"/>
                </div>
                <div class="fitem">
                    <label>Địa chỉ hình ảnh</label>
                    <input autocomplete="off" name="url" placeholder="Vui lòng nhập địa chỉ hình ảnh"/>
                </div>
            `,
			confirm: () => {
				const title = $(".cm-modal input[name='title']").val() || 'Test';
				const url = $(".cm-modal input[name='url']").val() || 'http://';
				this._replaceSelection(cm, ` ![${title}](${url}) `);
				cm.focus();
			}
		});
	}
	handleTable(cm) {
		this._openModal({
			title: 'Chèn bảng',
			innerHtml: `
                <div class="fitem">
                    <label>hàng bảng</label>
                    <input style="width: 50px; flex: none; margin-right: 10px;" value="3" autocomplete="off" name="row"/>
                    <label>cột bảng</label>
                    <input style="width: 50px; flex: none;" value="3" autocomplete="off" name="column"/>
                </div>
            `,
			confirm: () => {
				let row = $(".cm-modal input[name='row']").val();
				let column = $(".cm-modal input[name='column']").val();
				if (isNaN(row)) row = 3;
				if (isNaN(column)) column = 3;
				let rowStr = '';
				let rangeStr = '';
				let columnlStr = '';
				for (let i = 0; i < column; i++) {
					rowStr += '| Tiêu đề ';
					rangeStr += '| :--: ';
				}
				for (let i = 0; i < row; i++) {
					for (let j = 0; j < column; j++) columnlStr += '| hình thức ';
					columnlStr += '|\n';
				}
				const htmlStr = `${rowStr}|\n${rangeStr}|\n${columnlStr}\n`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n\n' + htmlStr);
				else this._replaceSelection(cm, htmlStr);
				cm.focus();
			}
		});
	}
	handleGird(cm) {
		this._openModal({
			title: 'Chèn lưới',
			innerHtml: `
                <div class="fitem">
                    <label>Số cột lưới</label>
                    <input value="3" autocomplete="off" name="column" placeholder="Vui lòng nhập số cột lưới"/>
                </div>
                <div class="fitem">
                    <label>Khoảng lưới</label>
                    <input value="15" autocomplete="off" name="gap" placeholder="Vui lòng nhập khoảng lưới"/>
                </div>
            `,
			confirm: () => {
				const column = $(".cm-modal input[name='column']").val();
				const gap = $(".cm-modal input[name='gap']").val();
				const htmlStr = `{gird column="${column}" gap="${gap}"}\n{gird-item}\n Nội dung khoảng lưới một\n{/gird-item}\n{gird-item}\n Nội dung khoảng lưới hai\n{/gird-item}\n{gird-item}\n Nội dung khoảng lưới ba\n{/gird-item}\n{/gird}`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n\n' + htmlStr);
				else this._replaceSelection(cm, htmlStr);
				cm.focus();
			}
		});
	}
	handleCodeBlock(cm) {
		const language = 'rss+atom+ssml+mathml+svg+html+markup+css+clike+javascript+abap+abnf+actionscript+ada+agda+al+antlr4+apacheconf+apex+apl+applescript+aql+arduino+arff+asciidoc+aspnet+asm6502+autohotkey+autoit+bash+basic+batch+bbcode+birb+bison+bnf+brainfuck+brightscript+bro+bsl+c+csharp+cpp+cfscript+chaiscript+cil+clojure+cmake+cobol+coffeescript+concurnas+csp+coq+crystal+css-extras+csv+cypher+d+dart+dataweave+dax+dhall+diff+django+dns-zone-file+docker+dot+ebnf+editorconfig+eiffel+ejs+elixir+elm+etlua+erb+erlang+excel-formula+fsharp+factor+false+firestore-security-rules+flow+fortran+ftl+gml+gcode+gdscript+gedcom+gherkin+git+glsl+go+graphql+groovy+haml+handlebars+haskell+haxe+hcl+hlsl+http+hpkp+hsts+ichigojam+icon+icu-message-format+idris+ignore+inform7+ini+io+j+java+javadoc+javadoclike+javastacktrace+jexl+jolie+jq+jsdoc+js-extras+json+json5+jsonp+jsstacktrace+js-templates+julia+keyman+kotlin+kumir+latex+latte+less+lilypond+liquid+lisp+livescript+llvm+log+lolcode+lua+makefile+markdown+markup-templating+matlab+mel+mizar+mongodb+monkey+moonscript+n1ql+n4js+nand2tetris-hdl+naniscript+nasm+neon+nevod+nginx+nim+nix+nsis+objectivec+ocaml+opencl+openqasm+oz+parigp+parser+pascal+pascaligo+psl+pcaxis+peoplecode+perl+php+phpdoc+php-extras+plsql+powerquery+powershell+processing+prolog+promql+properties+protobuf+pug+puppet+pure+purebasic+purescript+python+qsharp+q+qml+qore+r+racket+jsx+tsx+reason+regex+rego+renpy+rest+rip+roboconf+robotframework+ruby+rust+sas+sass+scss+scala+scheme+shell-session+smali+smalltalk+smarty+sml+solidity+solution-file+soy+sparql+splunk-spl+sqf+sql+squirrel+stan+iecst+stylus+swift+t4-templating+t4-cs+t4-vb+tap+tcl+tt2+textile+toml+turtle+twig+typescript+typoscript+unrealscript+uri+v+vala+vbnet+velocity+verilog+vhdl+vim+visual-basic+warpscript+wasm+wiki+xeora+xml-doc+xojo+xquery+yaml+yang+zig';
		const languageArr = language.split('+').sort((a, b) => a.localeCompare(b));
		const sessionStorageType = sessionStorage.getItem('selectType') || '';
		let htmlStr = '';
		languageArr.forEach(item => {
			htmlStr += `<option ${sessionStorageType === item ? 'selected' : ''} value="${item}">${item.toUpperCase()}</option>`;
		});
		this._openModal({
			title: 'Chèn khối mã',
			innerHtml: `
                <div class="fitem">
                    <label>Loại ngôn ngữ</label>
                    <select name="type">
                        <option value="">- Vui lòng chọn loại ngôn ngữ -</option>
                        ${htmlStr}
                    </select>
                </div>
            `,
			confirm: () => {
				const type = $(".cm-modal select[name='type']").val();
				if (!type) return;
				const htmlStr = `\`\`\`${type}\ncode here...\n\`\`\``;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n\n' + htmlStr);
				else this._replaceSelection(cm, htmlStr);
				cm.focus();
				sessionStorage.setItem('selectType', type);
			}
		});
	}
	handleAbout() {
		this._openModal({
			title: 'Xung quanh',
			hasFooter: false,
			innerHtml: `
                <ul>
                    <li>Tính năng shortcode đang được phát triển ...</li>
                    <li>Chỉ hỗ trợ tải lên dán hình ảnh mạng (ảnh chụp màn hình, v.v.)</li>
                    <li>Trình chỉnh sửa này chỉ dành cho chủ đề của Joe và không thể được chuyển sang các chủ đề khác nếu không được phép!</li>
                </ul>
            `
		});
	}
	handleTask(cm, type) {
		const str = type ? '{x}' : '{ }';
		this._replaceSelection(cm, ` ${str} `);
		cm.focus();
	}
	handleNetease(cm, type) {
		this._openModal({
			title: type ? 'Danh sách phát trên đám mây Netease' : 'Đám mây Netease đơn',
			innerHtml: `
				<div class="fitem">
					<label>Bài hát${type ? 'Ca sỹ' : 'Bài hát'}　ID</label>
					<input autocomplete="off" name="id" placeholder="Vui lòng nhập ID bài hát${type ? 'Ca sỹ' : 'Bài hát'}ID"/>
				</div>
				<div class="fitem">
					<label>Màu chủ đề</label>
					<input style="width: 44px;padding: 0 2px;flex: none" autocomplete="off" value="#1989fa" name="color" type="color"/>
				</div>
				<div class="fitem">
					<label>Tự chạy</label>
					<select name="autoplay">
						<option value="1" selected>Đồng ý</option>
						<option value="0">Không</option>
					</select>
				</div>
            `,
			confirm: () => {
				const id = $(".cm-modal input[name='id']").val();
				const color = $(".cm-modal input[name='color']").val();
				const autoplay = $(".cm-modal select[name='autoplay']").val();
				const str = `\n{${type ? 'music-list' : 'music'} id="${id}" color="${color}" ${autoplay === '1' ? 'autoplay="autoplay"' : ''}/}\n\n`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n' + str);
				else this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
	handleBilibili(cm) {
		this._openModal({
			title: 'BiliBili Video',
			innerHtml: `
				<div class="fitem">
					<label>VideoBvid</label>
					<input autocomplete="off" name="bvid" placeholder="Vui lòng nhập video Bvid"/>
				</div>
				<div class="fitem">
					<label>Tuyển tập video</label>
					<input autocomplete="off" name="page" placeholder="Vui lòng nhập một lựa chọn video"/>
				</div>
            `,
			confirm: () => {
				const bvid = $(".cm-modal input[name='bvid']").val();
				const page = $(".cm-modal input[name='page']").val();
				const str = `\n{bilibili bvid="${bvid}" page="${page}"/}\n\n`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n' + str);
				else this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
	handleDplayer(cm) {
		this._openModal({
			title: 'Video M3U8/MP4',
			innerHtml: `
				<div class="fitem">
					<label>Địa chỉ video</label>
					<input autocomplete="off" name="src" placeholder="Vui lòng nhập địa chỉ video"/>
				</div>
            `,
			confirm: () => {
				const src = $(".cm-modal input[name='src']").val();
				const str = `\n{dplayer src="${src}"/}\n\n`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n' + str);
				else this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
	handleDraft() {
		$('#btn-save').click();
	}
	handleExpression(cm) {
		$.ajax({
			url: window.JoeConfig.expressionAPI,
			dataType: 'json',
			success: res => {
				let tabbarStr = '';
				let listsStr = '';
				for (let key in res) {
					const arr = res[key];
					tabbarStr += `<div class="tabbar-item ${key === 'bong bóng' ? 'active' : ''}" data-show="${key}">${key}</div>`;
					listsStr += `<div class="lists ${key === 'bong bóng' ? 'active' : ''}" data-show="${key}">${arr.map(item => `<div class="lists-item" data-text="${item.data}">${key === 'Kaomoji' ? item.icon : `<img src="${window.JoeConfig.themeURL + item.icon}">`}</div>`).join(' ')}</div>`;
				}
				this._openModal({
					title: 'Biểu hiện bình thường',
					hasFooter: false,
					innerHtml: `<div class="tabbar">${tabbarStr}</div>${listsStr}`,
					handler: () => {
						$('.cm-modal__wrapper-bodyer .tabbar-item').on('click', function () {
							const show = $(this).attr('data-show');
							$(this).addClass('active').siblings().removeClass('active');
							$('.cm-modal__wrapper-bodyer .lists').removeClass('active');
							$(".cm-modal__wrapper-bodyer .lists[data-show='" + show + "']").addClass('active');
						});
						const _this = this;
						$('.cm-modal__wrapper-bodyer .lists-item').on('click', function () {
							const text = $(this).attr('data-text');
							_this._replaceSelection(cm, ` ${text} `);
							$('.cm-modal').removeClass('active');
							cm.focus();
						});
					}
				});
			}
		});
	}
	handleMtitle(cm) {
		this._openModal({
			title: 'Tiêu đề trung tâm',
			innerHtml: `
				<div class="fitem">
					<label>Nội dung tiêu đề</label>
					<input autocomplete="off" maxlength="10" name="text" placeholder="Vui lòng nhập nội dung tiêu đề (trong vòng 10 ký tự)"/>
				</div>
            `,
			confirm: () => {
				const text = $(".cm-modal input[name='text']").val();
				const str = `\n{mtitle title="${text}"/}\n\n`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n' + str);
				else this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
	handleHtml(cm) {
		const str = `${this._getLineCh(cm) ? '\n' : ''}!!!\n<p align="center">Căn giữa</p>\n<p align="right">Căn phải</p>\n<font size="5" color="red">Kích thước màu</font>\n!!!\n`;
		this._replaceSelection(cm, str);
		cm.focus();
	}
	handleHide(cm) {
		const str = `${this._getLineCh(cm) ? '\n\n' : '\n'}{hide}\nNội dung cần được ẩn\n{/hide}\n\n`;
		this._replaceSelection(cm, str);
		cm.focus();
	}
	handleAbtn(cm) {
		this._openModal({
			title: 'Các nút',
			innerHtml: `
				<div class="fitem">
					<label>Biểu tượng nút</label>
					<input autocomplete="off" name="icon" placeholder="Vui lòng nhập biểu tượng fa, ví dụ: fa-download"/>
				</div>
				<div class="fitem">
					<label>Biểu tượng</label>
					<a href="https://fontawesome.dashgame.com" target="_blank">fontawesome.dashgame.com</a>
				</div>
				<div class="fitem">
					<label>Màu nút</label>
					<input style="width: 44px;padding: 0 2px;flex: none" autocomplete="off" value="#ff6800" name="color" type="color"/>
				</div>
				<div class="fitem">
					<label>Liên kết nhảy</label>
					<input autocomplete="off" name="href" placeholder="Vui lòng nhập liên kết nhảy"/>
				</div>
				<div class="fitem">
					<label>Nút tròn góc</label>
					<input autocomplete="off" name="radius" placeholder="Vui lòng nhập các góc bo tròn của nút, ví dụ: 17,5px"/>
				</div>
				<div class="fitem">
					<label>Nội dung nút</label>
					<input autocomplete="off" name="content" placeholder="Vui lòng nhập nội dung nút"/>
				</div>
            `,
			confirm: () => {
				const icon = $(".cm-modal input[name='icon']").val();
				const color = $(".cm-modal input[name='color']").val();
				const href = $(".cm-modal input[name='href']").val();
				const radius = $(".cm-modal input[name='radius']").val();
				const content = $(".cm-modal input[name='content']").val();
				const str = ` {abtn icon="${icon}" color="${color}" href="${href}" radius="${radius}" content="${content}"/} `;
				this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
	handleAnote(cm) {
		this._openModal({
			title: 'Nút ghi chú',
			innerHtml: `
				<div class="fitem">
					<label>Biểu tượng nút</label>
					<input autocomplete="off" name="icon" placeholder="Vui lòng nhập biểu tượng fa, ví dụ: fa-download"/>
				</div>
				<div class="fitem">
					<label>Biểu tượng</label>
					<a href="https://fontawesome.dashgame.com" target="_blank">fontawesome.dashgame.com</a>
				</div>
				<div class="fitem">
					<label>Liên kết nhảy</label>
					<input autocomplete="off" name="href" placeholder="Vui lòng nhập liên kết nhảy"/>
				</div>
				<div class="fitem">
					<label>Loại nút</label>
					<select name="type">
						<option value="secondary" selected>secondary</option>
						<option value="success">success</option>
						<option value="warning">warning</option>
						<option value="error">error</option>
						<option value="info">info</option>
					</select>
				</div>
				<div class="fitem">
					<label>Nội dung nút</label>
					<input autocomplete="off" name="content" placeholder="Vui lòng nhập nội dung nút"/>
				</div>
            `,
			confirm: () => {
				const icon = $(".cm-modal input[name='icon']").val();
				const href = $(".cm-modal input[name='href']").val();
				const type = $(".cm-modal select[name='type']").val();
				const content = $(".cm-modal input[name='content']").val();
				const str = ` {anote icon="${icon}" href="${href}" type="${type}" content="${content}"/} `;
				this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
	handleDotted(cm) {
		this._openModal({
			title: 'Đường chấm màu',
			innerHtml: `
				<div class="fitem">
					<label>Màu bắt đầu</label>
					<input style="width: 44px;padding: 0 2px;flex: none" autocomplete="off" value="#ff6c6c" name="startColor" type="color"/>
				</div>
				<div class="fitem">
					<label>Màu kết thúc</label>
					<input style="width: 44px;padding: 0 2px;flex: none" autocomplete="off" value="#1989fa" name="endColor" type="color"/>
				</div>
            `,
			confirm: () => {
				const startColor = $(".cm-modal input[name='startColor']").val();
				const endColor = $(".cm-modal input[name='endColor']").val();
				const str = `\n{dotted startColor="${startColor}" endColor="${endColor}"/}\n\n`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n' + str);
				else this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
	handleCardDefault(cm) {
		this._openModal({
			title: 'Thẻ mặc định',
			innerHtml: `
				<div class="fitem">
					<label>Tiêu đề thẻ</label>
					<input autocomplete="off" name="label" placeholder="Vui lòng nhập tiêu đề thẻ"/>
				</div>
				<div class="fitem">
					<label>Chiều rộng thẻ</label>
					<input autocomplete="off" name="width" placeholder="Vui lòng nhập chiều rộng thẻ, ví dụ: 100%"/>
				</div>
            `,
			confirm: () => {
				const label = $(".cm-modal input[name='label']").val();
				const width = $(".cm-modal input[name='width']").val();
				const str = `\n{card-default label="${label}" width="${width}"}\nNội dung thẻ\n{/card-default}\n\n`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n' + str);
				else this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
	handleMessage(cm) {
		this._openModal({
			title: 'Thông báo',
			innerHtml: `
				<div class="fitem">
					<label>Loại tin nhắn</label>
					<select name="type">
						<option value="success" selected>success</option>
						<option value="info">info</option>
						<option value="warning">warning</option>
						<option value="error">error</option>
					</select>
				</div>
				<div class="fitem" style="align-items: flex-start">
					<label>Nội dung tin nhắn</label>
					<textarea autocomplete="off" name="content" placeholder="Vui lòng nhập nội dung tin nhắn></textarea>
				</div>
            `,
			confirm: () => {
				const type = $(".cm-modal select[name='type']").val();
				const content = $(".cm-modal textarea[name='content']").val();
				const str = `\n{message type="${type}" content="${content}"/}\n\n`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n' + str);
				else this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
	handleProgress(cm) {
		this._openModal({
			title: 'Thanh tiến trình',
			innerHtml: `
				<div class="fitem">
					<label>Tỷ lệ phần trăm</label>
					<input autocomplete="off" name="percentage" placeholder="Vui lòng nhập tỷ lệ phần trăm (tối đa 100%)"/>
				</div>
				<div class="fitem">
					<label>Tự phối màu</label>
					<input style="width: 44px;padding: 0 2px;flex: none" autocomplete="off" value="#ff6c6c" name="color" type="color"/>
				</div>
            `,
			confirm: () => {
				const percentage = $(".cm-modal input[name='percentage']").val();
				const color = $(".cm-modal input[name='color']").val();
				const str = `\n{progress percentage="${percentage}" color="${color}"/}\n\n`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n' + str);
				else this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
	handleCallout(cm) {
		this._openModal({
			title: 'Chèn chú thích',
			innerHtml: `
				<div class="fitem">
					<label>Màu viền</label>
					<input style="width: 44px;padding: 0 2px;flex: none" autocomplete="off" value="#f0ad4e" name="color" type="color"/>
				</div>
            `,
			confirm: () => {
				const color = $(".cm-modal input[name='color']").val();
				const str = `\n{callout color="${color}"}\nNội dung nhãn\n{/callout}\n\n`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n' + str);
				else this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
	handleMp3(cm) {
		this._openModal({
			title: 'Chèn nhạc',
			innerHtml: `
				<div class="fitem">
					<label>Tên âm thanh</label>
					<input autocomplete="off" name="name" placeholder="Vui lòng nhập tên âm thanh"/>
				</div>
				<div class="fitem">
					<label>Địa chỉ âm thanh</label>
					<input autocomplete="off" name="url" placeholder="Vui lòng nhập địa chỉ âm thanh"/>
				</div>
				<div class="fitem">
					<label>Ảnh bìa âm thanh</label>
					<input autocomplete="off" name="cover" placeholder="Vui lòng nhập địa chỉ hình ảnh"/>
				</div>
				<div class="fitem">
					<label>Màu chủ đề</label>
					<input style="width: 44px;padding: 0 2px;flex: none" autocomplete="off" value="#f0ad4e" name="theme" type="color"/>
				</div>
				<div class="fitem">
					<label>Tự chạy</label>
					<select name="autoplay">
						<option value="1" selected>Đồng ý</option>
						<option value="0">Không</option>
					</select>
				</div>
            `,
			confirm: () => {
				const name = $(".cm-modal input[name='name']").val();
				const url = $(".cm-modal input[name='url']").val();
				const cover = $(".cm-modal input[name='cover']").val();
				const theme = $(".cm-modal input[name='theme']").val();
				const autoplay = $(".cm-modal select[name='autoplay']").val();
				const str = `\n{mp3 name="${name}" url="${url}" cover="${cover}" theme="${theme}" ${autoplay === '1' ? 'autoplay="autoplay"' : ''}/}\n\n`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n' + str);
				else this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
	handleTabs(cm) {
		const str = `${this._getLineCh(cm) ? '\n\n' : '\n'}{tabs}\n{tabs-pane label="Tag 1"}\nTag 1\n{/tabs-pane}\n{tabs-pane label="Tag 2"}\n Gắn nhãn hai nội dung\n{/tabs-pane}\n{/tabs}\n\n`;
		this._replaceSelection(cm, str);
		cm.focus();
	}
	handleCardList(cm) {
		const str = `${this._getLineCh(cm) ? '\n\n' : '\n'}{card-list}\n{card-list-item}\n Liệt kê một nội dung\n{/card-list-item}\n{card-list-item}\n Liệt kê hai nội dung\n{/card-list-item}\n{/card-list}\n\n`;
		this._replaceSelection(cm, str);
		cm.focus();
	}
	handleTimeline(cm) {
		const str = `${this._getLineCh(cm) ? '\n\n' : '\n'}{timeline}\n{timeline-item color="#19be6b"}\n Chính thức ra mắt\n{/timeline-item}\n{timeline-item color="#ed4014"}\n Xóa thư viện và chạy đi\n{/timeline-item}\n{/timeline}\n\n`;
		this._replaceSelection(cm, str);
		cm.focus();
	}
	handleCardDescribe(cm) {
		const str = `${this._getLineCh(cm) ? '\n\n' : '\n'}{card-describe title="Mô tả thẻ"}\nNội dung thẻ\n{/card-describe}\n\n`;
		this._replaceSelection(cm, str);
		cm.focus();
	}
	handleCopy(cm) {
		this._openModal({
			title: 'Sao chép văn bản',
			innerHtml: `
				<div class="fitem">
					<label>Hiển thị bản sao</label>
					<input autocomplete="off" name="showText" placeholder="Vui lòng nhập văn bản hiển thị"/>
				</div>
				<div class="fitem" style="align-items: flex-start">
					<label>Sao chép nội dung</label>
					<textarea autocomplete="off" name="copyText" placeholder="Vui lòng nhập nội dung cần sao chép"></textarea>
				</div>
            `,
			confirm: () => {
				const showText = $(".cm-modal input[name='showText']").val();
				const copyText = $(".cm-modal textarea[name='copyText']").val();
				const str = `\n{copy showText="${showText}" copyText="${copyText}"/}\n\n`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n' + str);
				else this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
	handleLamp(cm) {
		const str = `${this._getLineCh(cm) ? '\n\n' : '\n'}{lamp/}\n\n`;
		this._replaceSelection(cm, str);
		cm.focus();
	}
	handleCollapse(cm) {
		const str = `${this._getLineCh(cm) ? '\n\n' : '\n'}{collapse}\n{collapse-item label="Thu gọn tiêu đề một" open}\n Thu gọn tiêu đề một\n{/collapse-item}\n{collapse-item label="Thu gọn tiêu đề hai"}\n Thu gọn tiêu đề hai\n{/collapse-item}\n{/collapse}\n\n`;
		this._replaceSelection(cm, str);
		cm.focus();
	}
	handleAlert(cm) {
		this._openModal({
			title: 'Cảnh báo',
			innerHtml: `
				<div class="fitem">
					<label>Loại nhắc nhở</label>
					<select name="type">
						<option value="info" selected>info</option>
						<option value="success">success</option>
						<option value="warning">warning</option>
						<option value="error">error</option>
					</select>
				</div>
            `,
			confirm: () => {
				const type = $(".cm-modal select[name='type']").val();
				const str = `\n{alert type="${type}"}\nCảnh báo\n{/alert}\n\n`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n' + str);
				else this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
	handleCloud(cm) {
		this._openModal({
			title: 'Tải xuống đĩa mạng',
			innerHtml: `
				<div class="fitem">
					<label>Loại đĩa mạng</label>
					<select name="type">
						<option value="default" selected>Đĩa mạng mặc định</option>
						<option value="360">Đĩa mạng 360</option>
						<option value="bd">Đĩa mạng Baidu</option>
						<option value="ty">Đĩa mạng Tianyi</option>
						<option value="ct">Đĩa mạng Citycom</option>
						<option value="wy">Đĩa mạng đám mây vi mô</option>
						<option value="github">Kho lưu trữ Github</option>
						<option value="lz">Đĩa mạng đám mây Lansuo</option>
					</select>
				</div>
				<div class="fitem">
					<label>Hiển thị tiêu đề</label>
					<input autocomplete="off" name="title" placeholder="Vui lòng nhập tiêu đề hiển thị"/>
				</div>
				<div class="fitem">
					<label>Liên kết tải xuống</label>
					<input autocomplete="off" name="url" placeholder="Vui lòng nhập địa chỉ đĩa mạng"/>
				</div>
				<div class="fitem">
					<label>Lấy lại mật khẩu</label>
					<input autocomplete="off" name="password" placeholder="Vui lòng nhập mã trích xuất (không bắt buộc)"/>
				</div>
            `,
			confirm: () => {
				const type = $(".cm-modal select[name='type']").val();
				const title = $(".cm-modal input[name='title']").val();
				const url = $(".cm-modal input[name='url']").val();
				const password = $(".cm-modal input[name='password']").val();
				const str = `\n{cloud title="${title}" type="${type}" url="${url}" password="${password}"/}\n\n`;
				if (this._getLineCh(cm)) this._replaceSelection(cm, '\n' + str);
				else this._replaceSelection(cm, str);
				cm.focus();
			}
		});
	}
}
