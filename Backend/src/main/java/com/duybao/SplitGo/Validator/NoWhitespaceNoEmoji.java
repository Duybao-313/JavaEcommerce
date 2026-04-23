package com.duybao.SplitGo.Validator;

import java.lang.annotation.*;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Documented
@Constraint(validatedBy = NoWhitespaceNoEmojiValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface NoWhitespaceNoEmoji {
    String message() default "PASSWORD_INVALID_CHARS";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
