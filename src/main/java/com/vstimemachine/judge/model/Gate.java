package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
public class Gate {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    @JsonIgnore
    private Long version;
    private LocalDateTime dateCreate = LocalDateTime.now();

    private Integer number;
    private Boolean finish;
    private Integer position;
    private Double distance;
    private Long delay;
    private Boolean speed;

    @ManyToOne
    @JoinColumn(name="competition_id")
    private Competition competition;
}
