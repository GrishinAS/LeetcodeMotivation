package com.grishin.leetcodemotivation.spring.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

/**
 * CORS filter registered inside Spring Security's filter chain (not Tomcat's).
 * aws-serverless-java-container dispatches requests directly through Spring Security,
 * bypassing Tomcat's outer filter chain, so @Order / @Component alone won't work.
 * <p>
 * Registered via SpringSecurityConfiguration.addFilterBefore().
 */
@Slf4j
@Component
public class CorsHandlingFilter extends OncePerRequestFilter {

    @Value("${app.cors.allowed-origins}")
    private List<String> configuredOrigins;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String origin = resolveOrigin(request);
        String requestMethod = request.getMethod();

        log.info("CORS filter: method={} origin={} headers={}", requestMethod, origin,
                Collections.list(request.getHeaderNames()));

        if (origin != null && isAllowed(origin)) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Content-Type-Options");
            response.setHeader("Access-Control-Max-Age", "3600");

            if ("OPTIONS".equalsIgnoreCase(requestMethod) && resolveHeader(request, "access-control-request-method") != null) {
                response.setStatus(HttpServletResponse.SC_OK);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveOrigin(HttpServletRequest request) {
        // Try standard casing first (works when container uses case-insensitive map)
        String v = request.getHeader("Origin");
        if (v != null) return v;
        // Fall back to lowercase (HTTP/2 normalized by API Gateway)
        v = request.getHeader("origin");
        if (v != null) return v;
        // Last resort: case-insensitive scan of all header names
        return resolveHeader(request, "origin");
    }

    private String resolveHeader(HttpServletRequest request, String name) {
        Enumeration<String> names = request.getHeaderNames();
        if (names == null) return null;
        while (names.hasMoreElements()) {
            String n = names.nextElement();
            if (n.equalsIgnoreCase(name)) return request.getHeader(n);
        }
        return null;
    }

    private boolean isAllowed(String origin) {
        for (String configured : configuredOrigins) {
            if (origin.equalsIgnoreCase(configured)) return true;
        }
        return origin.endsWith(".vercel.app")
                || origin.equals("https://leetstreak.pro")
                || origin.startsWith("http://localhost")
                || origin.startsWith("http://127.0.0.1");
    }
}
