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
public class Broadcast {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    private TypeBroadcast typeBroadcast;

    @ManyToOne
    @JoinColumn(name="competition_id")
    private Competition competition;

    @ManyToOne
    private Report report;

    private Boolean showInMainScreen = false;



}
