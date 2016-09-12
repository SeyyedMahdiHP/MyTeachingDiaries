var wp_url = '/sogrady';

function insertAfter(node, referenceNode) {
	referenceNode.parentNode.insertBefore(node, referenceNode.nextSibling);
}
function view_archive_month(url) {
	if (url != '') {
		location.href = url;
	}
}
function akaa_show_post(id) {
	if ($('post_' + id).className.indexOf('link') != -1) {
		var link = '&link=1';
	}
	else {
		var link = '';
	}
	$('post_' + id).className = '';
	$('post_summary_' + id).style.display = 'none';
	var target = $('post_content_' + id);
	target.style.display = 'block';
	if (target.innerHTML == '') {
		target.innerHTML = '<div class="loading"></div>';
		var akaaAjax = new Ajax.Updater(
			target,
			wp_url + "/index.php",
			{
				method: "get",
				parameters: "ak_action=akaa_post_content&id=" + id + link
			}
		);
		var close = document.createElement('div');
		close.id = 'post_close_' + id;
		close.className = 'close';
		close.innerHTML = '<a href="#post_' + id + '" onclick="akaa_hide_post(\'' + id + '\');">Close</a>';
		insertAfter(close, target);
	}
	else {
		$('post_close_' + id).style.display = 'block';
	}
}

function akaa_hide_post(id) {
	$('post_content_' + id).style.display = 'none';
	$('post_close_' + id).style.display = 'none';
	$('post_summary_' + id).style.display = 'block';
}

function akac_show_comments(id, count) {
	var target = $('post-comments-' + id);
	if (target.innerHTML == '') {
		target.innerHTML = '<div class="loading"></div>';
		$('comments-link-' + id).innerHTML = 'Hide Comments';
		var akaaAjax = new Ajax.Updater(
			target,
			wp_url + "/index.php",
			{
				method: "get",
				parameters: "ak_action=akac_comments&id=" + id
			}
		);
	}
	else {
		target.innerHTML = '';
		if (count == '1') {
			$('comments-link-' + id).innerHTML = count + ' Comment';
		}
		else {
			$('comments-link-' + id).innerHTML = count + ' Comments';
		}
	}
}
