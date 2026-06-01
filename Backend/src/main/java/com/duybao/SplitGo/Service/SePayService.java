package com.duybao.SplitGo.Service;

import com.duybao.SplitGo.DTO.request.payment.SePayIpnRequest;
import com.duybao.SplitGo.DTO.response.payment.SePayPaymentResponse;
import com.duybao.SplitGo.Model.Order;

public interface SePayService {
    SePayPaymentResponse createPayment(Order order);
    boolean verifyIpnSignature(SePayIpnRequest request, String receivedSignature);
    void handleIpn(SePayIpnRequest request);
    String getPaymentFormHtml(Order order);
}
