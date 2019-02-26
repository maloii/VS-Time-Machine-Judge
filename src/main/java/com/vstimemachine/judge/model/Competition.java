package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
public class Competition {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    @JsonIgnore
    private Long version;

    private String name;
    private String map;
    private String logo;
    private LocalDateTime dateCreate = LocalDateTime.now();
    private Boolean selected = false;

    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL)
    private Set<Gate> gates;

    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL)
    private Set<Sportsman> sportsmen;

    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL)
    private Set<Group> groups;

    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL)
    @OrderBy("sort ASC")
    private Set<Round> rounds;

    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL)
    private Set<League> leagues;

    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL)
    private Set<Transponder> transponders;
}
