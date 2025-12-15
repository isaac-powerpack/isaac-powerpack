# MIT License
#
# Copyright (c) 2024 <COPYRIGHT_HOLDERS>
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
#

import carb
import omni.ext
import omni.kit.app

from .ui_builder import UIBuilder


class Extension(omni.ext.IExt):
    """The Extension class"""

    def on_startup(self, ext_id):
        """Method called when the extension is loaded/enabled"""
        carb.log_info(f"on_startup {ext_id}")
        ext_path = (
            omni.kit.app.get_app().get_extension_manager().get_extension_path(ext_id)
        )

        # UI handler
        self.ui_builder = UIBuilder(
            window_title="Pow Workcell Camera", menu_path="Window/Pow Workcell Camera"
        )

    def on_shutdown(self):
        """Method called when the extension is disabled"""
        carb.log_info("on_shutdown")

        # clean up UI
        self.ui_builder.cleanup()
