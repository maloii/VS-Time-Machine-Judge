package com.vstimemachine.judge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
public class Settings {

    @Id
    @GeneratedValue
    private Long id;

    private TypeSettings typeSettings;

    private String value;

    @ManyToOne(cascade = CascadeType.PERSIST)
    private Competition competition;
}
