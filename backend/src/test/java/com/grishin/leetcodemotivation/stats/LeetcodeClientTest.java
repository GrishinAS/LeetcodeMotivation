package com.grishin.leetcodemotivation.stats;

import graphql.Assert;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

//@Disabled
class LeetcodeClientTest {
    private LeetcodeClient leetcodeClient = new LeetcodeClient();

    @Test
    void getUserProfile() {
        leetcodeClient.getUserProfile("ghjdthrfafbkj");
    }

    @Test
    void getCurrentStat() {
        leetcodeClient.getCurrentStat("ghjdthrfafbkj");
    }

    @Test
    void getSubmissionCalendar() {
        Map<LocalDate, Integer> ghjdthrfafbkj = leetcodeClient.getSubmissionCalendar("ghjdthrfafbkj");
        Assert.assertNotNull(ghjdthrfafbkj);
    }

    @Test
    public void loginWithGoogle() {
        String email = "";
        String password = "";
        System.setProperty("webdriver.chrome.driver", "/opt/google/chrome/chrome");
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        WebDriver driver = new ChromeDriver(options);

        try {
            // Navigate to LeetCode login
            driver.get("https://leetcode.com/accounts/login/");

            // Click Google sign-in button
            driver.findElement(By.className("google-oauth-btn")).click();

            // Fill Google credentials
            driver.findElement(By.id("identifierId")).sendKeys(email);
            driver.findElement(By.id("identifierNext")).click();

            // Wait and enter password
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
            wait.until(ExpectedConditions.elementToBeClickable(By.name("password")));
            driver.findElement(By.name("password")).sendKeys(password);
            driver.findElement(By.id("passwordNext")).click();

            // Wait for redirect to LeetCode
            wait.until(ExpectedConditions.urlContains("leetcode.com"));

            // Extract cookies
            Map<String, String> cookies = new HashMap<>();
            for (Cookie cookie : driver.manage().getCookies()) {
                cookies.put(cookie.getName(), cookie.getValue());
            }

        } finally {
            driver.quit();
        }
    }
}