package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.rest.core.annotation.RestResource;

import javax.persistence.*;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
public class GroupSportsman {


    @Id
    @GeneratedValue
    @JsonInclude
    private Long id;

    @Version
    @JsonIgnore
    private Long version;

    private Integer sort;

    @OneToOne
    @JoinColumn(name="sportsman_id")
    @RestResource(exported = false)
    private Sportsman sportsman;

    @ManyToOne
    @JoinColumn(name="group_id")
    private Group group;


}
