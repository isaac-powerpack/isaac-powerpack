"""
The Kit extension system tests for Python has additional wrapping
to make test auto-discoverable add support for async/await tests.
The easiest way to set up the test class is to have it derive from
the omni.kit.test.AsyncTestCase class that implements them.

Visit the next link for more details:
  https://docs.omniverse.nvidia.com/kit/docs/kit-manual/latest/guide/testing_exts_python.html
"""

import omni.kit.test


class TestExtension(omni.kit.test.AsyncTestCase):
    async def setUp(self):
        """Method called to prepare the test fixture"""
        super().setUp()
        # ---------------
        # Do custom setUp
        # ---------------

    async def tearDown(self):
        """Method called immediately after the test method has been called"""
        # ------------------
        # Do custom tearDown
        # ------------------
        super().tearDown()

    # --------------------------------------------------------------------

    async def test_extension(self):
        # Kit extension system test for Python is based on the unittest module.
        # Visit https://docs.python.org/3/library/unittest.html to see the
        # available assert methods to check for and report failures.
        print("Test case: test_extension")
        self.assertTrue(True)
