import importlib.util, tempfile, unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('audit',Path(__file__).with_name('audit-vps-paths.py'))
audit=importlib.util.module_from_spec(spec);spec.loader.exec_module(audit)
class AuditTests(unittest.TestCase):
    def test_inventory_reports_standalone_paths_and_does_not_follow_links(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)/'docroot';root.mkdir()
            (root/'app').mkdir();(root/'app'/'index.php').write_text('private source')
            outside=Path(temp)/'outside';outside.mkdir();(outside/'secret').write_text('secret')
            (root/'alias').symlink_to(outside,target_is_directory=True)
            before=(root/'app'/'index.php').read_bytes()
            result=audit.inventory(root)
            records={r['path']:r for r in result['records']}
            self.assertEqual(records['app/index.php']['group'],'review')
            self.assertEqual(records['alias']['kind'],'symlink')
            self.assertNotIn('alias/secret',records)
            self.assertEqual((root/'app'/'index.php').read_bytes(),before)
            self.assertEqual(result['errors'],[])
if __name__=='__main__': unittest.main()
