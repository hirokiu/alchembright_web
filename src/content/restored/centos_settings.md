---
"source_system": "movable-type"
"source_id": -11
"source_id_kind": "local archival ID; not an original MT entry ID"
"content_type": "post"
"status": "publish"
"original_status": "Draft"
"title": "CentOS settings"
"canonical_path": "/blog/restored/2011/centos_settings/"
"original_url": null
"published_at_local": "2011-03-28T16:20:53"
"published_at_gmt": null
"modified_at_local": "2011-03-28T16:20:53"
"first_published_at": "2026-09-09"
"source_timezone": null
"category_ids":
  - 9
"tag_ids":
  - -5
  - -7
"original_category_labels": []
"excerpt": "過去の下書きを本人確認のうえ公開した記事です。"
"mt_basename": "centos_settings"
"conversion_format": "html-preserved"
"conversion_warnings":
  - "semantic_comparison_required_html_fallback"
"reviewed_content_sha256": "877b8d7ad4cc25f86ab397a191504cbd1f7215a4b71a3ad5ca610cd9072a9895"
---

<pre>自分用のメモ

基本は yum でインストールしたいのでリポジトリを追加

 wget http://download.fedora.redhat.com/pub/epel/5/i386/epel-release-5-4.noarch.rpm
 wget http://rpms.famillecollet.com/el5.i386/remi-release-5-8.el5.remi.noarch.rpm
 rpm -Uvh remi-release-5-8.el5.remi.noarch.rpm 
 rpm -Uvh epel-release-5-4.noarch.rpm 
 rpm -Uvh remi-release-5-8.el5.remi.noarch.rpm 

apacheの最新はここのリポジトリを追加

cd /etc/yum.repos.d/
ls
vi utter.repo

[utter]
name=Jason's Utter Ramblings Repo
baseurl=http://www.jasonlitka.com/media/EL$releasever/$basearch/
enabled=0
gpgcheck=1
gpgkey=http://www.jasonlitka.com/media/RPM-GPG-KEY-jlitka


cd ../
yum --enablerepo=utter install httpd</pre>
