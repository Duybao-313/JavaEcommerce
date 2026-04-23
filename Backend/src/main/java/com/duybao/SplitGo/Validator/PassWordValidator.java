package com.duybao.SplitGo.Validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PassWordValidator implements ConstraintValidator<PassWordMin, String> {
    private int min;

    @Override
    public void initialize(PassWordMin constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
        this.min = constraintAnnotation.min();
    }

    @Override
    public boolean isValid(String s, ConstraintValidatorContext constraintValidatorContext) {
        if (s == null) return true;
        return s.length() >= min;
    }
}
