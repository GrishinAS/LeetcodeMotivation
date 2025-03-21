package com.grishin.leetcodemotivation.spring.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SpringSecurityConfiguration
{
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    public SpringSecurityConfiguration(UserDetailsServiceImpl userDetailsService, JwtAuthFilter jwtAuthFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, AuthenticationManager authenticationManager) throws Exception {
        CookieCsrfTokenRepository tokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        tokenRepository.setCookiePath("/");


        return http
                .cors(cors -> cors.configurationSource(apiConfigurationSource()))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(tokenRepository)
                        .csrfTokenRequestHandler(new CustomCsrfTokenRequestHandler())
                        .ignoringRequestMatchers("/user/login", "/user/signup"))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(new CsrfCookieFilter(), JwtAuthFilter.class)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/user/csrf").permitAll()
                        .requestMatchers(HttpMethod.POST, "/user/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/user/signup").permitAll()
                        .requestMatchers(HttpMethod.POST, "/error/**").permitAll()
                        .anyRequest().authenticated())
                .authenticationManager(authenticationManager)

                .exceptionHandling(handler -> handler.authenticationEntryPoint((request, response, exception) ->
                                response.sendError(HttpStatus.FORBIDDEN.value(), exception.getMessage()))
                        .accessDeniedHandler((request, response, exception) ->
                                response.sendError(HttpStatus.UNAUTHORIZED.value(), exception.getMessage()
                                )))
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
        return authenticationManagerBuilder.build();
    }

    public CorsConfigurationSource apiConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET","POST", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "X-CSRF-Token", "X-XSRF-TOKEN", "Cookie", "X-Content-Type-Options", "Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }


}
final class CustomCsrfTokenRequestHandler extends CsrfTokenRequestAttributeHandler  {
    @Override
    public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
        String actualToken = request.getHeader(csrfToken.getHeaderName());
        if (actualToken != null) {
            return actualToken;
        }

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals("XSRF-TOKEN")) {
                    return cookie.getValue();
                }
            }
        }
        return request.getParameter(csrfToken.getParameterName());
    }
    }
