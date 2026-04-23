package com.duybao.SplitGo.Validator;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {PassWordValidator.class})
public @interface PassWordMin {
    String message() default "PASSWORD_TOO_SHORT";

    int min();

    Class<? extends Payload>[] payload() default {};

    Class<?>[] groups() default {};
}
