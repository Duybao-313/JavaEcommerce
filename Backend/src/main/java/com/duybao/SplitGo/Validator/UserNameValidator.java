package com.duybao.SplitGo.Validator;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.duybao.SplitGo.Repository.UserRepository;

@Component
public class UserNameValidator implements ConstraintValidator<UniqueUserName, String> {
    private final UserRepository userRepository;
    private final StringNormalize stringNormalize;

    @Autowired
    public UserNameValidator(UserRepository userRepository, StringNormalize stringNormalize) {
        this.userRepository = userRepository;
        this.stringNormalize = stringNormalize;
    }

    @Override
    public void initialize(UniqueUserName constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String s, ConstraintValidatorContext constraintValidatorContext) {
        if (s == null) return true;
        String normal = stringNormalize.normalize(s);
        if (!s.equals(normal)) {
            constraintValidatorContext.disableDefaultConstraintViolation();
            constraintValidatorContext
                    .buildConstraintViolationWithTemplate("INVALID_USERNAME")
                    .addConstraintViolation();
            return false;
        }

        if (userRepository.findByUsernameIgnoreCase(normal).isPresent()) {
            constraintValidatorContext.disableDefaultConstraintViolation();
            constraintValidatorContext
                    .buildConstraintViolationWithTemplate("USERNAME_ALREADY_EXISTS")
                    .addConstraintViolation();
            return false;
        }
        return true;
    }
}
