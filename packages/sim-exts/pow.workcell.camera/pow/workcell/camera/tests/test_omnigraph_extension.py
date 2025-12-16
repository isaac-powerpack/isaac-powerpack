"""
OmniGraph tests have some shared setUp and tearDown operations.
The easiest way to set up the test class is to have it derive from
the omni.graph.core.tests.OmniGraphTestCase class that implements them.

Visit the next link for more details:
  https://docs.omniverse.nvidia.com/kit/docs/omni.graph.docs/latest/howto/Testing.html
"""

import omni.graph.core.tests as ogts


class TestOmniGraphExtension(ogts.OmniGraphTestCase):
    async def setUp(self):
        """Method called to prepare the test fixture"""
        await super().setUp()
        # ---------------
        # Do custom setUp
        # ---------------

    async def tearDown(self):
        """Method called immediately after the test method has been called"""
        # ------------------
        # Do custom tearDown
        # ------------------
        await super().tearDown()

    # --------------------------------------------------------------------

    async def test_extension(self):
        # Kit extension system test for Python is based on the unittest module.
        # Visit https://docs.python.org/3/library/unittest.html to see the
        # available assert methods to check for and report failures.
        self.assertTrue(True)
