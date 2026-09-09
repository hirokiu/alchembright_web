---
"source_system": "movable-type"
"source_id": -12
"source_id_kind": "local archival ID; not an original MT entry ID"
"content_type": "post"
"status": "publish"
"original_status": "Draft"
"title": "gitosis install"
"canonical_path": "/blog/restored/2011/gitosis_install/"
"original_url": null
"published_at_local": "2011-06-25T17:47:15"
"published_at_gmt": null
"modified_at_local": "2011-06-25T17:47:15"
"first_published_at": "2026-09-09"
"source_timezone": null
"category_ids":
  - 9
"tag_ids": []
"original_category_labels": []
"excerpt": "過去の下書きを本人確認のうえ公開した記事です。"
"mt_basename": "gitosis_install"
"conversion_format": "html-preserved"
"conversion_warnings":
  - "semantic_comparison_required_html_fallback"
"reviewed_content_sha256": "fbf8d0c029b88f46a965cfa9672f6bbc78dbebacd5a4d8872731e9b176c80716"
---

<pre>[user@host .ssh]$ cd /var/lib/gitosis/
[user@host gitosis]$ ls
[user@host gitosis]$ ls
[user@host gitosis]$ sudo -H -u gitosis gitosis-init &lt; /home/user/.ssh/user.pub 
Initialized empty Git repository in /var/lib/gitosis/repositories/gitosis-admin.git/
Reinitialized existing Git repository in /var/lib/gitosis/repositories/gitosis-admin.git/

例えば管理者の適当なディレクトリに移動して
git clone gitosis@localhost:gitosis-admin.git</pre>
