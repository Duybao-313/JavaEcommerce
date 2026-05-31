package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.Response.ecommerce.AddressResponse;
import com.duybao.SplitGo.DTO.request.ecommerce.CreateAddressRequest;
import com.duybao.SplitGo.DTO.request.ecommerce.UpdateAddressRequest;
import java.util.List;

public interface AddressService {
    List<AddressResponse> getMyAddresses(Long userId);

    AddressResponse createAddress(Long userId, CreateAddressRequest request);

    AddressResponse updateAddress(Long userId, Long addressId, UpdateAddressRequest request);

    void deleteAddress(Long userId, Long addressId);

    AddressResponse setDefaultAddress(Long userId, Long addressId);
}
