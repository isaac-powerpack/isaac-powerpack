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
