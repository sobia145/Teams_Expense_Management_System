package com.tems.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "budgets", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"group_id", "category_id", "period"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer budgetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    // Mapping category via ID strictly for isolation check bounds
    @Column(name = "category_id", nullable = false)
    private Integer categoryId;

    @Column(name = "limit_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal limitAmount;

    @Builder.Default
    @Column(length = 50)
    private String period = "TRIP";

    private String category;

    @Column(name="custom_category")
    private String customCategory;
}
