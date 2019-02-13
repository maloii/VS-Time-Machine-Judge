package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;

import javax.persistence.*;

@Data
@Entity
@AllArgsConstructor
public class Pilot {

    private @Id
    @GeneratedValue
    Long id;
    private String firstName;
    private String lastName;
    private String middleName;
    private String photo;

    private @Version
    @JsonIgnore
    Long version;

    private @ManyToOne
    Judge judge;

    private Pilot() {
    }

    public Pilot(String firstName, String lastName, String middleName, String photo, Judge judge) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.middleName = middleName;
        this.photo = photo;
        this.judge = judge;
    }


}
