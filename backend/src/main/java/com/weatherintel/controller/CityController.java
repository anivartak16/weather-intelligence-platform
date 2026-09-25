package com.weatherintel.controller;

import com.weatherintel.service.CityLookupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cities")
@CrossOrigin(origins = "*")
public class CityController {

    private final CityLookupService cityLookupService;

    public CityController(CityLookupService cityLookupService) {
        this.cityLookupService = cityLookupService;
    }

    @GetMapping("/india")
    public ResponseEntity<List<Map<String, Object>>> getIndianCities() {
        return ResponseEntity.ok(cityLookupService.getIndianCities());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchCities(
            @RequestParam(required = false, defaultValue = "") String query) {
        List<Map<String, Object>> allCities = cityLookupService.getIndianCities();
        if (query == null || query.isBlank()) {
            return ResponseEntity.ok(allCities.stream().limit(15).toList());
        }
        String q = query.trim().toLowerCase();
        List<Map<String, Object>> matched = allCities.stream()
                .filter(c -> {
                    String name = c.get("name") != null ? c.get("name").toString().toLowerCase() : "";
                    String state = c.get("state") != null ? c.get("state").toString().toLowerCase() : "";
                    return name.contains(q) || state.contains(q);
                })
                .limit(20)
                .toList();
        return ResponseEntity.ok(matched);
    }
}
