import importlib.util
from pathlib import Path
import unittest

spec=importlib.util.spec_from_file_location('worker',Path(__file__).with_name('worker.py'))
worker=importlib.util.module_from_spec(spec)
spec.loader.exec_module(worker)

class WorkerTests(unittest.TestCase):
    def setUp(self):
        self.context={'scope':'section','entries':[{'id':'hero.lead','field':'value','value':'Old'}]}
        self.request={'version':1,'id':'1700000000000-00000000-0000-4000-8000-000000000000','prompt':'Update intro','context':self.context}

    def test_request_and_scoped_plan(self):
        worker.validate_request(self.request)
        worker.validate_plan({'summary':'Update','changes':[{'target':'section','id':'hero.lead','field':'value','value':'New'}]},self.context)

    def test_reject_out_of_scope_and_duplicate_actions(self):
        with self.assertRaises(ValueError):
            worker.validate_plan({'summary':'Bad','changes':[{'target':'project','id':'x','field':'value','value':'New'}]},self.context)
        action={'target':'section','id':'hero.lead','field':'value','value':'New'}
        with self.assertRaises(ValueError):
            worker.validate_plan({'summary':'Bad','changes':[action,action]},self.context)

    def test_prompt_is_never_a_file_path_or_executable_action(self):
        bad={**self.request,'id':'../../server.js'}
        with self.assertRaises(ValueError): worker.validate_request(bad)
        with self.assertRaises(ValueError): worker.validate_plan({'summary':'Bad','changes':[],'code':'anything'},self.context)

if __name__=='__main__': unittest.main()
