//package com.grishin.leetcodemotivation.spring.security;
//
//import jakarta.annotation.Nonnull;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.http.HttpHeaders;
//import org.springframework.security.web.csrf.CsrfToken;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//import java.util.Collection;
//import java.util.List;
//
//public final class CsrfCookieFilter extends OncePerRequestFilter {
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, @Nonnull HttpServletResponse response, FilterChain filterChain)
//            throws ServletException, IOException {
//        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
//        // Render the token value to a cookie by causing the deferred token to be loaded
//        csrfToken.getToken();
//
//        filterChain.doFilter(request, response);
//
//        // Modify the CSRF cookie with SameSite=None; Secure
//        Collection<String> headers = response.getHeaders(HttpHeaders.SET_COOKIE);
//        if (headers != null) {
//            List<String> newHeaders = headers.stream()
//                    .map(header -> {
//                        if (header.startsWith("XSRF-TOKEN")) {
//                            return header + "; Secure; SameSite=None";
//                        }
//                        return header;
//                    })
//                    .toList();
//
//            response.setHeader(HttpHeaders.SET_COOKIE, String.join(",", newHeaders));
//        }
//    }
//}
