package com.duybao.SplitGo.Validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class NoWhitespaceNoEmojiValidator implements ConstraintValidator<NoWhitespaceNoEmoji, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return true; // let @NotBlank handle null/empty if required

        int len = value.length();
        for (int i = 0; i < len; ) {
            int cp = value.codePointAt(i);

            // 1) Không cho phép whitespace
            if (Character.isWhitespace(cp)) return false;

            // 2) Kiểm tra emoji / pictograph bằng các khoảng Unicode phổ biến
            if (isEmojiCodePoint(cp)) return false;

            i += Character.charCount(cp);
        }
        return true;
    }

    private boolean isEmojiCodePoint(int cp) {
        // Các khoảng phổ biến chứa emoji / pictographs
        return (cp >= 0x1F300 && cp <= 0x1F5FF) // Misc Symbols and Pictographs
                || (cp >= 0x1F600 && cp <= 0x1F64F) // Emoticons
                || (cp >= 0x1F680 && cp <= 0x1F6FF) // Transport & Map
                || (cp >= 0x1F700 && cp <= 0x1F77F) // Alchemical Symbols (một số emoji)
                || (cp >= 0x1F900 && cp <= 0x1F9FF) // Supplemental Symbols and Pictographs
                || (cp >= 0x2600 && cp <= 0x26FF) // Misc symbols
                || (cp >= 0x2700 && cp <= 0x27BF) // Dingbats
                || (cp >= 0xFE00 && cp <= 0xFE0F) // Variation Selectors
                || (cp >= 0x1F1E6 && cp <= 0x1F1FF); // Regional indicator symbols (flags)
    }
}
