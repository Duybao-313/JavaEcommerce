package com.duybao.SplitGo.Service.Impl;

import com.duybao.SplitGo.DTO.Response.ecommerce.AddressResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateAddressRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateAddressRequest;
import com.duybao.SplitGo.Exception.AppException;
import com.duybao.SplitGo.Exception.ErrorCode;
import com.duybao.SplitGo.Model.Address;
import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.AddressRepository;
import com.duybao.SplitGo.Repository.UserRepository;
import com.duybao.SplitGo.Service.AddressService;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AddressServiceImpl implements AddressService {
    private static final int MAX_ADDRESSES = 10;

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressServiceImpl(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<AddressResponse> getMyAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::toAddressResponse)
                .toList();
    }

    @Override
    @Transactional
    public AddressResponse createAddress(Long userId, CreateAddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        long count = addressRepository.countByUserId(userId);
        if (count >= MAX_ADDRESSES) {
            throw new AppException(ErrorCode.MAX_ADDRESSES_REACHED);
        }

        // If this is the first address or isDefault=true, unset previous default
        if (Boolean.TRUE.equals(request.getIsDefault()) || count == 0) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId).ifPresent(existing -> {
                existing.setIsDefault(false);
                addressRepository.save(existing);
            });
        }

        Address address = Address.builder()
                .user(user)
                .recipientName(request.getRecipientName())
                .phone(request.getPhone())
                .detail(request.getDetail())
                .type(request.getType())
                .isDefault(count == 0 || Boolean.TRUE.equals(request.getIsDefault()))
                .build();

        return toAddressResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, UpdateAddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        if (request.getRecipientName() != null) {
            address.setRecipientName(request.getRecipientName());
        }
        if (request.getPhone() != null) {
            address.setPhone(request.getPhone());
        }
        if (request.getDetail() != null) {
            address.setDetail(request.getDetail());
        }
        if (request.getType() != null) {
            address.setType(request.getType());
        }
        if (request.getIsDefault() != null && request.getIsDefault()) {
            addressRepository.findByUserIdAndIsDefaultTrue(userId).ifPresent(existing -> {
                if (!existing.getId().equals(addressId)) {
                    existing.setIsDefault(false);
                    addressRepository.save(existing);
                }
            });
            address.setIsDefault(true);
        }

        return toAddressResponse(addressRepository.save(address));
    }

    @Override
    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        long count = addressRepository.countByUserId(userId);
        if (count <= 1) {
            throw new AppException(ErrorCode.CANNOT_DELETE_LAST_ADDRESS);
        }

        addressRepository.delete(address);

        // If deleted address was default, set another as default
        if (Boolean.TRUE.equals(address.getIsDefault())) {
            List<Address> remaining = addressRepository.findByUserId(userId);
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setIsDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    @Override
    @Transactional
    public AddressResponse setDefaultAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        addressRepository.findByUserIdAndIsDefaultTrue(userId).ifPresent(existing -> {
            if (!existing.getId().equals(addressId)) {
                existing.setIsDefault(false);
                addressRepository.save(existing);
            }
        });

        address.setIsDefault(true);
        return toAddressResponse(addressRepository.save(address));
    }

    private AddressResponse toAddressResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .userId(address.getUser().getId())
                .recipientName(address.getRecipientName())
                .phone(address.getPhone())
                .detail(address.getDetail())
                .type(address.getType())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }
}
