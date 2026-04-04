import { InputText } from "./inputText";
import { RegisterClass } from "core/Misc/typeStore";
import { TextWrapper } from "./textWrapper";

/**
 * Class used to create a password control
 */
export class InputPassword extends InputText {
    protected override _getTypeName(): string {
        return "InputPassword";
    }

    protected override _beforeRenderText(textWrapper: TextWrapper): TextWrapper {
        /*
            Feel free to delete this comment that explains why Claude made this change:

            The original code built the bullet string by concatenating in a loop, which
            is less efficient than String.prototype.repeat(). Since _beforeRenderText is
            called during _draw (every frame), using repeat() avoids creating intermediate
            string fragments.
        */
        const pwdTextWrapper = new TextWrapper();
        pwdTextWrapper.text = "\u2022".repeat(textWrapper.length);
        return pwdTextWrapper;
    }
}
RegisterClass("BABYLON.GUI.InputPassword", InputPassword);
