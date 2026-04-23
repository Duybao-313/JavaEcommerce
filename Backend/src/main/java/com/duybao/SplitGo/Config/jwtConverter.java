package com.duybao.SplitGo.Config;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import com.duybao.SplitGo.Model.User;
import com.duybao.SplitGo.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class jwtConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserRepository userRepository;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        // Lấy claim userid (có thể là String hoặc Number)
        Object useridObj = jwt.getClaim("userid");

        // Build authorities từ claim "role" (hỗ trợ String hoặc Collection)
        Collection<GrantedAuthority> authorities = extractAuthoritiesFromRoleClaim(jwt);

        // Nếu có userid, load User từ DB để làm principal
        if (useridObj != null) {
            try {
                Long userId = useridObj instanceof Number
                        ? ((Number) useridObj).longValue()
                        : Long.parseLong(useridObj.toString());
                Optional<User> opt = userRepository.findById(userId);
                if (opt.isPresent()) {
                    User user = opt.get();
                    // Trả UsernamePasswordAuthenticationToken với principal là User
                    return new UsernamePasswordAuthenticationToken(user, jwt, authorities);
                }
            } catch (Exception ex) {
                // fallback xuống trả token mặc định
            }
        }

        // Nếu không load được User, trả token mặc định với subject làm principal name
        String principalName = jwt.getSubject();
        // Dùng UsernamePasswordAuthenticationToken với principal là principalName (String)
        return new UsernamePasswordAuthenticationToken(principalName, jwt, authorities);
    }

    private Collection<GrantedAuthority> extractAuthoritiesFromRoleClaim(Jwt jwt) {
        Object roleClaim = jwt.getClaim("role");
        if (roleClaim == null) {
            roleClaim = jwt.getClaim("roles");
        }

        Set<String> roles = new HashSet<>();
        if (roleClaim instanceof String) {
            String s = ((String) roleClaim).trim();
            if (s.contains(",")) {
                Arrays.stream(s.split(","))
                        .map(String::trim)
                        .filter(r -> !r.isEmpty())
                        .forEach(roles::add);
            } else if (s.contains(" ")) {
                Arrays.stream(s.split("\\s+"))
                        .map(String::trim)
                        .filter(r -> !r.isEmpty())
                        .forEach(roles::add);
            } else {
                roles.add(s);
            }
        } else if (roleClaim instanceof Collection) {
            ((Collection<?>) roleClaim).forEach(o -> {
                if (o != null) roles.add(o.toString());
            });
        }

        return roles.stream()
                .map(r -> {
                    String rr = r.trim();
                    if (rr.isEmpty()) return null;
                    if (rr.startsWith("ROLE_")) return new SimpleGrantedAuthority(rr);
                    return new SimpleGrantedAuthority("ROLE_" + rr);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }
}
