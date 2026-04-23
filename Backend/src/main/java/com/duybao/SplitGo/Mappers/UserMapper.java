package com.duybao.SplitGo.Mappers;

import java.util.List;

import org.mapstruct.*;

import com.duybao.SplitGo.DTO.Response.User.UserDTO;
import com.duybao.SplitGo.DTO.request.UpdateUserRequest;
import com.duybao.SplitGo.DTO.request.UserRegisterRequest;
import com.duybao.SplitGo.Model.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDTO(User user);

    List<UserDTO> toDTOs(List<User> users);

    User toEntity(UserRegisterRequest user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void update(UpdateUserRequest userRequest, @MappingTarget User userStore);
}
